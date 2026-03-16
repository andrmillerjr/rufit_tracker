require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const seed = require('./seed');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const plansRoutes = require('./routes/plans');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/profile', profileRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

db.initDb()
  .then(() => seed())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
