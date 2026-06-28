const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/scheduled_posts.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function loadPosts() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function savePosts(posts) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
}

// 予約投稿一覧
router.get('/', requireAuth, (req, res) => {
  const posts = loadPosts();
  const clientPosts = posts.filter(p => p.igAccountId === req.igAccountId);
  res.json(clientPosts);
});

// 予約投稿登録
router.post('/', requireAuth, (req, res) => {
  const { scheduledAt, mediaType, imageUrl, imageUrls, videoUrl, caption, clientId } = req.body;

  if (!scheduledAt) {
    return res.status(400).json({ error: 'scheduledAt is required (ISO 8601)' });
  }

  const post = {
    id: uuidv4(),
    igAccountId: req.igAccountId,
    clientId: clientId || null,
    mediaType: mediaType || 'IMAGE',
    imageUrl,
    imageUrls,
    videoUrl,
    caption: caption || '',
    scheduledAt,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const posts = loadPosts();
  posts.push(post);
  savePosts(posts);

  res.json({ success: true, post });
});

// 予約投稿更新
router.put('/:id', requireAuth, (req, res) => {
  const posts = loadPosts();
  const idx = posts.findIndex(p => p.id === req.params.id && p.igAccountId === req.igAccountId);

  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (posts[idx].status === 'published') return res.status(400).json({ error: 'Cannot edit published post' });

  posts[idx] = { ...posts[idx], ...req.body, id: posts[idx].id, updatedAt: new Date().toISOString() };
  savePosts(posts);
  res.json({ success: true, post: posts[idx] });
});

// 予約投稿削除
router.delete('/:id', requireAuth, (req, res) => {
  const posts = loadPosts();
  const filtered = posts.filter(p => !(p.id === req.params.id && p.igAccountId === req.igAccountId));
  savePosts(filtered);
  res.json({ success: true });
});

// 投稿ステータス確認
router.get('/:id/status', requireAuth, (req, res) => {
  const posts = loadPosts();
  const post = posts.find(p => p.id === req.params.id && p.igAccountId === req.igAccountId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ id: post.id, status: post.status, publishedAt: post.publishedAt, error: post.error });
});

// cronジョブ: 1分ごとに予約投稿をチェックして実行
cron.schedule('* * * * *', async () => {
  const posts = loadPosts();
  const now = new Date();
  const due = posts.filter(p => p.status === 'pending' && new Date(p.scheduledAt) <= now);

  for (const post of due) {
    try {
      const IG_API = 'https://graph.facebook.com/v19.0';
      const token = post.accessToken;
      let containerId;

      if (post.mediaType === 'IMAGE' && post.imageUrl) {
        const r = await axios.post(`${IG_API}/${post.igAccountId}/media`, null, {
          params: { image_url: post.imageUrl, caption: post.caption, access_token: token }
        });
        containerId = r.data.id;
      } else if (post.mediaType === 'CAROUSEL' && post.imageUrls) {
        const childIds = await Promise.all(post.imageUrls.map(url =>
          axios.post(`${IG_API}/${post.igAccountId}/media`, null, {
            params: { image_url: url, is_carousel_item: true, access_token: token }
          }).then(r => r.data.id)
        ));
        const r = await axios.post(`${IG_API}/${post.igAccountId}/media`, null, {
          params: { media_type: 'CAROUSEL', children: childIds.join(','), caption: post.caption, access_token: token }
        });
        containerId = r.data.id;
      }

      if (containerId) {
        await axios.post(`${IG_API}/${post.igAccountId}/media_publish`, null, {
          params: { creation_id: containerId, access_token: token }
        });
        post.status = 'published';
        post.publishedAt = new Date().toISOString();
      }
    } catch (err) {
      post.status = 'failed';
      post.error = err.response?.data?.error?.message || err.message;
    }
  }

  if (due.length > 0) savePosts(posts);
});

module.exports = router;
