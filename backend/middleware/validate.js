const { body, validationResult } = require('express-validator');

// Return validation errors as JSON
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register rules
const registerRules = [
  body('username')
    .trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 chars')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only')
    .escape(),
  body('email')
    .isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password min 8 characters')
    .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
    .matches(/[0-9]/).withMessage('Password needs a number')
    .matches(/[!@#$%^&*]/).withMessage('Password needs a special character'),
];

// Login rules
const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

// Note rules — escape to prevent XSS via stored content
const noteRules = [
  body('title').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Title required (max 100)'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content required (max 5000)'),
  body('is_encrypted').optional().isBoolean(),
];

module.exports = { handleValidation, registerRules, loginRules, noteRules };
