const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const reportsService = require('../services/reportService');

const router = express.Router();
router.use(authenticateToken);

router.get('/summary', async (req, res, next) => {
  try {
    const summary = await reportsService.summary(req.user.id);
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
