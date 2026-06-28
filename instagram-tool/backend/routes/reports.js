const express = require('express');
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const IG_API = 'https://graph.facebook.com/v19.0';

// 月次レポートデータ生成
router.get('/monthly', requireAuth, async (req, res) => {
  const { year, month } = req.query;
  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) || now.getMonth() + 1;

  const since = new Date(y, m - 1, 1).getTime() / 1000;
  const until = new Date(y, m, 0, 23, 59, 59).getTime() / 1000;

  try {
    const [accountRes, insightsRes, mediaRes] = await Promise.all([
      axios.get(`${IG_API}/${req.igAccountId}`, {
        params: { fields: 'username,followers_count,media_count', access_token: req.accessToken }
      }),
      axios.get(`${IG_API}/${req.igAccountId}/insights`, {
        params: {
          metric: 'reach,impressions,profile_views,website_clicks',
          period: 'month',
          since,
          until,
          access_token: req.accessToken
        }
      }),
      axios.get(`${IG_API}/${req.igAccountId}/media`, {
        params: {
          fields: 'id,caption,media_type,timestamp,like_count,comments_count,permalink',
          limit: 50,
          since,
          until,
          access_token: req.accessToken
        }
      })
    ]);

    const insights = {};
    (insightsRes.data.data || []).forEach(m => {
      insights[m.name] = m.values?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
    });

    const posts = mediaRes.data.data || [];
    const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);
    const avgEngagement = posts.length > 0 ? (totalLikes + totalComments) / posts.length : 0;
    const engagementRate = accountRes.data.followers_count > 0
      ? (avgEngagement / accountRes.data.followers_count) * 100 : 0;

    // トップ投稿（エンゲージメント順）
    const topPosts = [...posts]
      .sort((a, b) => ((b.like_count || 0) + (b.comments_count || 0)) - ((a.like_count || 0) + (a.comments_count || 0)))
      .slice(0, 3);

    res.json({
      period: { year: y, month: m },
      account: accountRes.data,
      summary: {
        reach: insights.reach || 0,
        impressions: insights.impressions || 0,
        profileViews: insights.profile_views || 0,
        websiteClicks: insights.website_clicks || 0,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        avgEngagementRate: engagementRate.toFixed(2)
      },
      topPosts,
      allPosts: posts
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// CSV形式でレポートデータ出力
router.get('/monthly/csv', requireAuth, async (req, res) => {
  const { year, month } = req.query;
  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) || now.getMonth() + 1;

  const since = new Date(y, m - 1, 1).getTime() / 1000;
  const until = new Date(y, m, 0, 23, 59, 59).getTime() / 1000;

  try {
    const mediaRes = await axios.get(`${IG_API}/${req.igAccountId}/media`, {
      params: {
        fields: 'id,caption,media_type,timestamp,like_count,comments_count,permalink',
        limit: 100,
        since,
        until,
        access_token: req.accessToken
      }
    });

    const posts = mediaRes.data.data || [];
    const rows = [
      ['投稿日時', '種別', 'いいね数', 'コメント数', 'キャプション', 'URL'],
      ...posts.map(p => [
        new Date(p.timestamp).toLocaleString('ja-JP'),
        p.media_type,
        p.like_count || 0,
        p.comments_count || 0,
        `"${(p.caption || '').replace(/"/g, '""')}"`,
        p.permalink
      ])
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="report_${y}${String(m).padStart(2,'0')}.csv"`);
    res.send('﻿' + csv); // BOM付きUTF-8
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
