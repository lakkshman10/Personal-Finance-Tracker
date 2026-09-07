const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const transactionService = require('../services/transactionService');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try { return res.json(await transactionService.list(req.user.id, { fromDate: req.query.fromDate, toDate: req.query.toDate, type: req.query.type, limit: req.query.limit, offset: req.query.offset })); } catch (error) { return next(error); }
});
router.post('/', async (req, res, next) => {
  try { return res.status(201).json(await transactionService.create(req.user.id, req.body || {})); } catch (error) { return next(error); }
});
router.patch('/:id', async (req, res, next) => {
  try { const transaction = await transactionService.update(req.user.id, req.params.id, req.body || {}); if (!transaction) return next(new AppError('Transaction not found.', 404)); return res.json(transaction); } catch (error) { return next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try { const deleted = await transactionService.remove(req.user.id, req.params.id); if (!deleted) return next(new AppError('Transaction not found.', 404)); return res.status(204).send(); } catch (error) { return next(error); }
});
module.exports = router;
