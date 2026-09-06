const express = require('express');
const mongoose = require('mongoose');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/db', async (req, res) => {
  let postgresql = 'disconnected';
  let mongodb = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    postgresql = 'connected';
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message);
  }

  const healthy = postgresql === 'connected' && mongodb === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'error',
    databases: {
      postgresql,
      mongodb,
    },
  });
});

module.exports = router;
