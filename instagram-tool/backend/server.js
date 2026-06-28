require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');
const mediaRoutes = require('./routes/media');
const schedulerRoutes = require('./routes/scheduler');
const clientsRoutes = require('./routes/clients');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'treswin-instagram-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/auth', authRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TRESWIN Instagram Tool backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
