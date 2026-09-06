const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const transactionService = require('../services/transactionService');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const transactions = await transactionService.list(req.user.id, {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      type: req.query.type,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const transaction = await transactionService.create(req.user.id, req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const transaction = await transactionService.update(req.user.id, req.params.id, req.body);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    return res.json(transaction);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await transactionService.remove(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found.' });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
