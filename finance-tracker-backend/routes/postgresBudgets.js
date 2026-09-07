const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const budgetService = require('../services/budgetService');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try { return res.json(await budgetService.list(req.user.id, req.query.month)); } catch (error) { return next(error); }
});
router.post('/', async (req, res, next) => {
  try { return res.status(201).json(await budgetService.create(req.user.id, req.body || {})); } catch (error) { return next(error); }
});
router.patch('/:id', async (req, res, next) => {
  try { const budget = await budgetService.update(req.user.id, req.params.id, req.body || {}); if (!budget) return next(new AppError('Budget not found.', 404)); return res.json(budget); } catch (error) { return next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try { const deleted = await budgetService.remove(req.user.id, req.params.id); if (!deleted) return next(new AppError('Budget not found.', 404)); return res.status(204).send(); } catch (error) { return next(error); }
});
module.exports = router;
