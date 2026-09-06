const express = require('express');
const authenticateFinanceUser = require('../middlewares/financeAuthMiddleware');
const budgetService = require('../services/budgetService');

const router = express.Router();
router.use(authenticateFinanceUser);

router.get('/', async (req, res) => {
  try {
    const budgets = await budgetService.list(req.user.id, req.query.month);
    return res.json(budgets);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const budget = await budgetService.create(req.user.id, req.body || {});
    return res.status(201).json(budget);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A budget already exists for this category and month.' });
    }
    return res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body || {});
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    return res.json(budget);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A budget already exists for this category and month.' });
    }
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
