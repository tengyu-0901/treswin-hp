function requireAuth(req, res, next) {
  const token = req.session.accessToken || req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Instagram認証が必要です' });
  }
  req.accessToken = token;
  req.igAccountId = req.session.igAccountId || req.headers['x-account-id'];
  next();
}

module.exports = { requireAuth };
