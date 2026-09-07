const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const validateEnvironment = require('./config/env');
validateEnvironment();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const authRoutes = require('./routes/auth');
const postgresBudgetRoutes = require('./routes/postgresBudgets');
const savingsGoalRoutes = require('./routes/savingsGoals');
const reportsRoutes = require('./routes/reports');
const newsRoutes = require('./routes/news');
const healthRoutes = require('./routes/health');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const debtRoutes = require('./routes/debts');
const errorHandler = require('./middlewares/errorHandler');
const prisma = require('./config/prisma');

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/postgres/budgets', postgresBudgetRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/health', healthRoutes);

app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try { await prisma.$disconnect(); console.log('PostgreSQL disconnected.'); process.exit(0); }
    catch (error) { console.error('Error during PostgreSQL shutdown:', error.message); process.exit(1); }
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
