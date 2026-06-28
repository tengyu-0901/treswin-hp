const express = require('express');
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const IG_API = 'https://graph.facebook.com/v19.0';

// アカウント基本情報
router.get('/account', requireAuth, async (req, res) => {
  try {
    const { data } = await axios.get(`${IG_API}/${req.igAccountId}`, {
      params: {
        fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website',
        access_token: req.accessToken
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// アカウントインサイト（リーチ・インプレッション・プロフィール閲覧数）
router.get('/account-metrics', requireAuth, async (req, res) => {
  const { period = 'day', since, until } = req.query;

  const metrics = [
    'reach',
    'impressions',
    'profile_views',
    'website_clicks',
    'follower_count',
    'email_contacts',
    'get_directions_clicks',
    'phone_call_clicks',
    'text_message_clicks'
  ];

  const params = {
    metric: metrics.join(','),
    period,
    access_token: req.accessToken
  };

  if (since) params.since = since;
  if (until) params.until = until;

  try {
    const { data } = await axios.get(`${IG_API}/${req.igAccountId}/insights`, { params });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// オーディエンス属性（年齢・性別・国・都市）
router.get('/audience', requireAuth, async (req, res) => {
  const metrics = [
    'audience_gender_age',
    'audience_locale',
    'audience_country',
    'audience_city'
  ];

  try {
    const { data } = await axios.get(`${IG_API}/${req.igAccountId}/insights`, {
      params: {
        metric: metrics.join(','),
        period: 'lifetime',
        access_token: req.accessToken
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// メディア一覧 + 各投稿のインサイト
router.get('/media', requireAuth, async (req, res) => {
  const { limit = 12 } = req.query;

  try {
    // メディア一覧取得
    const mediaRes = await axios.get(`${IG_API}/${req.igAccountId}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink',
        limit,
        access_token: req.accessToken
      }
    });

    const media = mediaRes.data.data || [];

    // 各投稿のインサイト並列取得
    const withInsights = await Promise.all(media.map(async (post) => {
      try {
        const insightRes = await axios.get(`${IG_API}/${post.id}/insights`, {
          params: {
            metric: 'impressions,reach,engagement,saved,video_views',
            access_token: req.accessToken
          }
        });
        const insights = {};
        (insightRes.data.data || []).forEach(m => {
          insights[m.name] = m.values?.[0]?.value ?? m.value;
        });
        return { ...post, insights };
      } catch {
        return { ...post, insights: {} };
      }
    }));

    res.json({ data: withInsights, paging: mediaRes.data.paging });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// エンゲージメント率計算 (サマリー)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const [accountRes, mediaRes] = await Promise.all([
      axios.get(`${IG_API}/${req.igAccountId}`, {
        params: {
          fields: 'followers_count,media_count',
          access_token: req.accessToken
        }
      }),
      axios.get(`${IG_API}/${req.igAccountId}/media`, {
        params: {
          fields: 'like_count,comments_count,timestamp',
          limit: 12,
          access_token: req.accessToken
        }
      })
    ]);

    const followers = accountRes.data.followers_count || 0;
    const posts = mediaRes.data.data || [];
    const totalEngagement = posts.reduce((sum, p) => sum + (p.like_count || 0) + (p.comments_count || 0), 0);
    const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;
    const engagementRate = followers > 0 ? (avgEngagement / followers) * 100 : 0;

    res.json({
      followers,
      mediaCount: accountRes.data.media_count,
      avgEngagement: Math.round(avgEngagement),
      engagementRate: engagementRate.toFixed(2),
      recentPosts: posts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ストーリーインサイト
router.get('/stories', requireAuth, async (req, res) => {
  try {
    const { data } = await axios.get(`${IG_API}/${req.igAccountId}/stories`, {
      params: {
        fields: 'id,media_type,media_url,timestamp',
        access_token: req.accessToken
      }
    });

    const storiesWithInsights = await Promise.all((data.data || []).map(async (story) => {
      try {
        const insightRes = await axios.get(`${IG_API}/${story.id}/insights`, {
          params: {
            metric: 'exits,impressions,reach,replies,taps_forward,taps_back',
            access_token: req.accessToken
          }
        });
        const insights = {};
        (insightRes.data.data || []).forEach(m => {
          insights[m.name] = m.values?.[0]?.value ?? m.value;
        });
        return { ...story, insights };
      } catch {
        return { ...story, insights: {} };
      }
    }));

    res.json({ data: storiesWithInsights });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
