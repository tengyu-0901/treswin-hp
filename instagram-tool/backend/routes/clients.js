const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/clients.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function load() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function save(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// クライアント一覧
router.get('/', (req, res) => {
  res.json(load());
});

// クライアント詳細
router.get('/:id', (req, res) => {
  const clients = load();
  const client = clients.find(c => c.id === req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

// クライアント登録
router.post('/', (req, res) => {
  const { name, company, igAccountId, igUsername, accessToken, plan, contractStart, contractEnd, notes, monthlyBudget } = req.body;

  if (!name || !igUsername) {
    return res.status(400).json({ error: 'name and igUsername are required' });
  }

  const client = {
    id: uuidv4(),
    name,
    company: company || '',
    igAccountId: igAccountId || '',
    igUsername,
    accessToken: accessToken || '',
    plan: plan || 'basic',
    contractStart: contractStart || new Date().toISOString().split('T')[0],
    contractEnd: contractEnd || '',
    monthlyBudget: monthlyBudget || 0,
    notes: notes || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const clients = load();
  clients.push(client);
  save(clients);

  res.json({ success: true, client });
});

// クライアント更新
router.put('/:id', (req, res) => {
  const clients = load();
  const idx = clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Client not found' });

  clients[idx] = { ...clients[idx], ...req.body, id: clients[idx].id, updatedAt: new Date().toISOString() };
  save(clients);
  res.json({ success: true, client: clients[idx] });
});

// クライアント削除
router.delete('/:id', (req, res) => {
  const clients = load();
  save(clients.filter(c => c.id !== req.params.id));
  res.json({ success: true });
});

// プラン一覧（固定）
router.get('/meta/plans', (req, res) => {
  res.json([
    { id: 'basic', name: 'ベーシックプラン', price: 30000, posts: 12, stories: 15 },
    { id: 'standard', name: 'スタンダードプラン', price: 50000, posts: 20, stories: 30 },
    { id: 'premium', name: 'プレミアムプラン', price: 80000, posts: 30, stories: 60 },
    { id: 'custom', name: 'カスタムプラン', price: null, posts: null, stories: null }
  ]);
});

module.exports = router;
