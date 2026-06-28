const express = require('express');
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const IG_API = 'https://graph.facebook.com/v19.0';

// 投稿作成（画像）
router.post('/publish/image', requireAuth, async (req, res) => {
  const { imageUrl, caption } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    // Step 1: メディアコンテナ作成
    const containerRes = await axios.post(`${IG_API}/${req.igAccountId}/media`, null, {
      params: {
        image_url: imageUrl,
        caption: caption || '',
        access_token: req.accessToken
      }
    });

    const containerId = containerRes.data.id;

    // Step 2: 公開
    const publishRes = await axios.post(`${IG_API}/${req.igAccountId}/media_publish`, null, {
      params: {
        creation_id: containerId,
        access_token: req.accessToken
      }
    });

    res.json({ success: true, mediaId: publishRes.data.id });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// カルーセル投稿
router.post('/publish/carousel', requireAuth, async (req, res) => {
  const { imageUrls, caption } = req.body;

  if (!Array.isArray(imageUrls) || imageUrls.length < 2) {
    return res.status(400).json({ error: 'imageUrls must be an array with at least 2 items' });
  }

  try {
    // 各画像のコンテナ作成
    const childIds = await Promise.all(imageUrls.map(url =>
      axios.post(`${IG_API}/${req.igAccountId}/media`, null, {
        params: { image_url: url, is_carousel_item: true, access_token: req.accessToken }
      }).then(r => r.data.id)
    ));

    // カルーセルコンテナ作成
    const carouselRes = await axios.post(`${IG_API}/${req.igAccountId}/media`, null, {
      params: {
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption: caption || '',
        access_token: req.accessToken
      }
    });

    // 公開
    const publishRes = await axios.post(`${IG_API}/${req.igAccountId}/media_publish`, null, {
      params: { creation_id: carouselRes.data.id, access_token: req.accessToken }
    });

    res.json({ success: true, mediaId: publishRes.data.id });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// リール投稿
router.post('/publish/reel', requireAuth, async (req, res) => {
  const { videoUrl, caption, coverUrl, shareToFeed = true } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  try {
    const params = {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption || '',
      share_to_feed: shareToFeed,
      access_token: req.accessToken
    };
    if (coverUrl) params.cover_url = coverUrl;

    const containerRes = await axios.post(`${IG_API}/${req.igAccountId}/media`, null, { params });
    const containerId = containerRes.data.id;

    // リール処理待ち確認
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status === 'IN_PROGRESS' && attempts < 20) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await axios.get(`${IG_API}/${containerId}`, {
        params: { fields: 'status_code', access_token: req.accessToken }
      });
      status = statusRes.data.status_code;
      attempts++;
    }

    if (status !== 'FINISHED') {
      return res.status(400).json({ error: `Media processing failed: ${status}` });
    }

    const publishRes = await axios.post(`${IG_API}/${req.igAccountId}/media_publish`, null, {
      params: { creation_id: containerId, access_token: req.accessToken }
    });

    res.json({ success: true, mediaId: publishRes.data.id });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
