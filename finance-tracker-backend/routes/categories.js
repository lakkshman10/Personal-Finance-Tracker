const express = require('express');
const authenticateFinanceUser = require('../middlewares/financeAuthMiddleware');
const categoryService = require('../services/categoryService');

const router = express.Router();
router.use(authenticateFinanceUser);

router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.list(req.user.id, req.query.type);
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const category = await categoryService.create(req.user.id, req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const category = await categoryService.update(req.user.id, req.params.id, req.body || {});
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    return res.json(category);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
