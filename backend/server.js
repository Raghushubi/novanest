require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const userRoutes = require('./routes/users');
const securityRoutes = require('./routes/security');

const app = express();

// =============================================
// SECURITY MIDDLEWARE
// =============================================

// Helmet sets security-related HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// Global rate limiter only
// (Login-specific limiter removed for smoother demo recording)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// ROUTES
// =============================================

// Auth routes WITHOUT strict auth limiter
app.use('/api/auth', authRoutes);

app.use('/api/notes', notesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/security', securityRoutes);

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'NovaNest',
    security: 'Helmet + JWT + bcrypt + input validation',
  });
});

// =============================================
// ERROR HANDLER
// =============================================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// =============================================
// SERVER START
// =============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 NovaNest backend running on http://localhost:${PORT}`);
  console.log(
    `🔐 Security: Helmet | JWT | bcrypt | Input validation`
  );
  console.log(
    `📖 Health check: http://localhost:${PORT}/api/health\n`
  );
});