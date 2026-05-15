const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/users/me — get own profile
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, avatar_filename, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users/avatar — upload avatar (file type + size validated in middleware)
router.post('/avatar', authenticate, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Delete old avatar if exists
    const user = db.prepare('SELECT avatar_filename FROM users WHERE id = ?').get(req.user.id);
    if (user?.avatar_filename) {
      const oldPath = path.join(__dirname, '../uploads', user.avatar_filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    db.prepare('UPDATE users SET avatar_filename = ? WHERE id = ?').run(req.file.filename, req.user.id);
    res.json({ filename: req.file.filename, message: 'Avatar updated!' });
  });
});

// GET /api/users — admin only: list all users
router.get('/', authenticate, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// GET /api/users/admin/notes — admin: see all notes
router.get('/admin/notes', authenticate, requireAdmin, (req, res) => {
  const notes = db.prepare(`
    SELECT n.*, u.username FROM notes n
    JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
  `).all();
  res.json(notes);
});

module.exports = router;
