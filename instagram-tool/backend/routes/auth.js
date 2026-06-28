const express = require('express');
const axios = require('axios');
const router = express.Router();

const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.META_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// OAuth 開始: Metaログイン画面へリダイレクト
router.get('/login', (req, res) => {
  const scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${scopes}` +
    `&response_type=code`;

  res.redirect(authUrl);
});

// OAuth コールバック: アクセストークン取得
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}?auth_error=${error}`);
  }

  try {
    // 短期トークン取得
    const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      }
    });

    const shortToken = tokenRes.data.access_token;

    // 長期トークンに交換
    const longTokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: shortToken
      }
    });

    const longToken = longTokenRes.data.access_token;

    // Instagramビジネスアカウント取得
    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: longToken, fields: 'instagram_business_account,name,access_token' }
    });

    const pages = pagesRes.data.data || [];
    const igAccounts = pages
      .filter(p => p.instagram_business_account)
      .map(p => ({
        pageId: p.id,
        pageName: p.name,
        igId: p.instagram_business_account.id,
        pageToken: p.access_token
      }));

    req.session.accessToken = longToken;
    req.session.igAccounts = igAccounts;

    if (igAccounts.length > 0) {
      req.session.igAccountId = igAccounts[0].igId;
      req.session.pageToken = igAccounts[0].pageToken;
    }

    res.redirect(`${FRONTEND_URL}/dashboard.html?auth=success`);
  } catch (err) {
    console.error('Auth error:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?auth_error=token_exchange_failed`);
  }
});

// セッション状態確認
router.get('/status', (req, res) => {
  if (req.session.accessToken) {
    res.json({
      authenticated: true,
      accounts: req.session.igAccounts || [],
      currentAccount: req.session.igAccountId
    });
  } else {
    res.json({ authenticated: false });
  }
});

// アカウント切り替え
router.post('/switch-account', (req, res) => {
  const { igId } = req.body;
  const accounts = req.session.igAccounts || [];
  const account = accounts.find(a => a.igId === igId);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  req.session.igAccountId = account.igId;
  req.session.pageToken = account.pageToken;
  res.json({ success: true, account });
});

// ログアウト
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
