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
  const food = db.prepare('SELECT * FROM food_plans WHERE user_id = ? ORDER BY id').all(userId);
  const exercise = db.prepare('SELECT * FROM exercise_plans WHERE user_id = ? ORDER BY id').all(userId);
  res.json({ food, exercise });
});

router.post('/:userId/food', (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== Number(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, description = '', day = 'День 1' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO food_plans (user_id, name, description, day) VALUES (?, ?, ?, ?)').run(userId, name, description, day);
  res.status(201).json({ id: result.lastInsertRowid, user_id: Number(userId), name, description, day });
});

router.post('/:userId/exercise', (req, res) => {
  const { userId } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== Number(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, description = '', sets = '', reps = '', day = 'День 1' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO exercise_plans (user_id, name, description, sets, reps, day) VALUES (?, ?, ?, ?, ?, ?)').run(userId, name, description, sets, reps, day);
  res.status(201).json({ id: result.lastInsertRowid, user_id: Number(userId), name, description, sets, reps, day });
});

router.delete('/food/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM food_plans WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== item.user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.prepare('DELETE FROM food_plans WHERE id = ?').run(id);
  res.json({ ok: true });
});

router.delete('/exercise/:id', (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT * FROM exercise_plans WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== item.user_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.prepare('DELETE FROM exercise_plans WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;
