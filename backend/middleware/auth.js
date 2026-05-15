const jwt = require('jsonwebtoken');
const db = require('../db/init');

// Verify JWT access token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or malformed' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin access required' });
  }
  next();
};

// Log security events
const logEvent = (userId, eventType, req, details = '') => {
  const { v4: uuidv4 } = require('uuid');
  db.prepare(`INSERT INTO security_logs (id, user_id, event_type, ip_address, user_agent, details)
              VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), userId || null, eventType,
      req.ip || req.connection?.remoteAddress || 'unknown',
      req.headers['user-agent'] || 'unknown',
      details);
};

module.exports = { authenticate, requireAdmin, logEvent };
