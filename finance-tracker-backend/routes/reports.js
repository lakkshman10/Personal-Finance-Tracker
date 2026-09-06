const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const reportsService = require('../services/reportService');

const router = express.Router();
router.use(authenticateToken);

router.get('/summary', async (req, res) => {
  try {
    const summary = await reportsService.summary(req.user.id);
    return res.json(summary);
  } catch (error) {
    console.error('Reports summary error:', error);
    return res.status(500).json({ message: 'Failed to load reports.' });
  }
});

module.exports = router;
