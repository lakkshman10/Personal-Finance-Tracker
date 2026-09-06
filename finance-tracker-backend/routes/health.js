const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      database: 'postgresql',
    });
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);

    res.status(503).json({
      status: 'error',
      database: 'postgresql',
    });
  }
});

module.exports = router;
