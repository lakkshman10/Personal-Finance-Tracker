const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const budgetService = require('../services/budgetService');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    return res.json(await budgetService.list(req.user.id, req.query.month));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    return res.status(201).json(await budgetService.create(req.user.id, req.body || {}));
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'A budget already exists for this category and month.' });
    return res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body || {});
    if (!budget) return res.status(404).json({ message: 'Budget not found.' });
    return res.json(budget);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'A budget already exists for this category and month.' });
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await budgetService.remove(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Budget not found.' });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
