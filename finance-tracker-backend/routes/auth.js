const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, signin, logout, check, refreshToken, getAccount, updateAccount, changePassword, getPreferences, updatePreferences } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many login/signup attempts. Please try again after 15 minutes.' }, standardHeaders: true, legacyHeaders: false });
const refreshLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { message: 'Too many token refresh attempts. Please try again later.' }, standardHeaders: true, legacyHeaders: false });

router.post('/signup', authLimiter, signup);
router.post('/signin', authLimiter, signin);
router.post('/logout', logout);
router.get('/check', authenticateToken, check);
router.post('/refresh-token', refreshLimiter, refreshToken);
router.get('/account', authenticateToken, getAccount);
router.patch('/account', authenticateToken, updateAccount);
router.post('/account/password', authenticateToken, changePassword);
router.get('/preferences', authenticateToken, getPreferences);
router.put('/preferences', authenticateToken, updatePreferences);
module.exports = router;
