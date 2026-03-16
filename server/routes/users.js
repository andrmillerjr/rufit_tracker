const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, created_at FROM users ORDER BY id').all();
  res.json({ users });
});

router.post('/', async (req, res) => {
  const { email, name, password, role = 'user' } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Email, name, and password required' });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)').run(email, name, hash, role);
    res.status(201).json({ user: { id: result.lastInsertRowid, email, name, role } });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;
