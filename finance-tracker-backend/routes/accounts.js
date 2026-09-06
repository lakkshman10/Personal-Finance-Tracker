const express = require('express');
const authenticateFinanceUser = require('../middlewares/financeAuthMiddleware');
const accountService = require('../services/accountService');

const router = express.Router();
router.use(authenticateFinanceUser);

router.get('/', async (req, res) => {
  try {
    const accounts = await accountService.list(req.user.id, { activeOnly: req.query.activeOnly === 'true' });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const account = await accountService.create(req.user.id, req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const account = await accountService.update(req.user.id, req.params.id, req.body || {});
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    return res.json(account);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
