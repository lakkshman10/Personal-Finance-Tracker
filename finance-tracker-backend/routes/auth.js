const express = require('express');
const { signup, signin, check, refreshToken } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/check', authenticateToken, check);
router.post('/refresh-token', refreshToken);

module.exports = router;

