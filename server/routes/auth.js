const express = require('express');
const router = express.Router();

// Simple auth routes - in production, use proper JWT authentication
router.post('/register', (req, res) => {
  res.json({ message: 'Registration handled by Firebase Auth on frontend' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login handled by Firebase Auth on frontend' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout handled by Firebase Auth on frontend' });
});

module.exports = router;