const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/security/logs/me — own security logs
router.get('/logs/me', authenticate, (req, res) => {
  const logs = db.prepare(`SELECT * FROM security_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`).all(req.user.id);
  res.json(logs);
});

// GET /api/security/logs — admin: all logs
router.get('/logs', authenticate, requireAdmin, (req, res) => {
  const logs = db.prepare(`SELECT sl.*, u.username FROM security_logs sl LEFT JOIN users u ON sl.user_id = u.id ORDER BY sl.created_at DESC LIMIT 200`).all();
  res.json(logs);
});

// GET /api/security/headers — return what security headers are set (for demo)
router.get('/headers', (req, res) => {
  res.json({
    message: 'Security headers are applied via Helmet.js on every response',
    headers: {
      'Content-Security-Policy': 'Restricts sources for scripts, styles, images',
      'X-Frame-Options': 'DENY - prevents clickjacking',
      'X-Content-Type-Options': 'nosniff - prevents MIME sniffing',
      'Strict-Transport-Security': 'Forces HTTPS connections',
      'X-XSS-Protection': '1; mode=block - legacy XSS filter'
    }
  });
});

// GET /api/security/csrf-demo — return CSRF token info
router.get('/csrf-info', authenticate, (req, res) => {
  res.json({
    message: 'CSRF protection is active on all state-changing endpoints (POST/PUT/DELETE)',
    how: 'A CSRF token is embedded in forms and verified server-side via the csurf middleware',
    token_type: 'Double Submit Cookie pattern'
  });
});

module.exports = router;
