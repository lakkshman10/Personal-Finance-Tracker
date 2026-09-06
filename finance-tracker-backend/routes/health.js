const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'ok',
      databases: { postgresql: 'connected' },
    });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);
    return res.status(503).json({
      status: 'error',
      databases: { postgresql: 'disconnected' },
    });
  }
});

module.exports = router;
