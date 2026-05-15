const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { registerRules, loginRules, handleValidation } = require('../middleware/validate');
const { logEvent } = require('../middleware/auth');

const generateTokens = (user) => {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', registerRules, handleValidation, (req, res) => {
  const { username, email, password } = req.body;
  try {
    const exists = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (exists) return res.status(409).json({ error: 'Email or username already taken' });

    const passwordHash = bcrypt.hashSync(password, 12);
    const userId = uuidv4();
    db.prepare(`INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`)
      .run(userId, username, email, passwordHash);

    logEvent(userId, 'REGISTER', req, `New user: ${email}`);
    res.status(201).json({ message: 'Account created! Please log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', loginRules, handleValidation, (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      logEvent(null, 'LOGIN_FAIL', req, `Failed attempt for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`)
      .run(uuidv4(), user.id, refreshToken, expiresAt);

    logEvent(user.id, 'LOGIN_SUCCESS', req, `User logged in`);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar_filename }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?').get(refreshToken, decoded.id);
    if (!stored || new Date(stored.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    const { accessToken, refreshToken: newRefresh } = generateTokens(user);

    // Rotate refresh token
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`)
      .run(uuidv4(), user.id, newRefresh, expiresAt);

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
