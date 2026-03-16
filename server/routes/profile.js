const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== Number(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  res.json({ profile: profile || { user_id: Number(userId), age: null, height: null, weight: null, waist: null } });
});

router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== Number(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { age, height, weight, waist } = req.body;
  db.prepare('INSERT OR REPLACE INTO user_profiles (user_id, age, height, weight, waist) VALUES (?, ?, ?, ?, ?)').run(
    userId,
    age || null,
    height || null,
    weight || null,
    waist || null
  );
  res.json({ profile: { user_id: Number(userId), age, height, weight, waist } });
});

module.exports = router;
