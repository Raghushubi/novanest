const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { authenticate } = require('../middleware/auth');
const { noteRules, handleValidation } = require('../middleware/validate');

// GET /api/notes — get own notes
router.get('/', authenticate, (req, res) => {
  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(notes);
});

// POST /api/notes — create note (uses parameterized query — SQLi safe)
router.post('/', authenticate, noteRules, handleValidation, (req, res) => {
  const { title, content, is_encrypted } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO notes (id, user_id, title, content, is_encrypted) VALUES (?, ?, ?, ?, ?)`)
    .run(id, req.user.id, title, content, is_encrypted ? 1 : 0);
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  res.status(201).json(note);
});

// PUT /api/notes/:id — update note (ownership check)
router.put('/:id', authenticate, noteRules, handleValidation, (req, res) => {
  const { title, content, is_encrypted } = req.body;
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: 'Note not found or access denied' });
  db.prepare(`UPDATE notes SET title=?, content=?, is_encrypted=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(title, content, is_encrypted ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id));
});

// DELETE /api/notes/:id — delete note (ownership check)
router.delete('/:id', authenticate, (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: 'Note not found or access denied' });
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  res.json({ message: 'Note deleted' });
});

module.exports = router;
