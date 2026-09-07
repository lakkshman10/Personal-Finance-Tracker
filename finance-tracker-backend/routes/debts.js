const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const debtService = require('../services/debtService');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const allowed = ['ACTIVE', 'PAID_OFF', 'ARCHIVED'];
    const requested = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ACTIVE';
    const status = requested === 'ALL' ? undefined : requested;
    if (status && !allowed.includes(status)) return res.status(400).json({ message: 'Invalid debt status filter.' });
    return res.json(await debtService.list(req.user.id, status));
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.post('/', async (req, res) => {
  try { return res.status(201).json(await debtService.create(req.user.id, req.body || {})); }
  catch (error) { return res.status(400).json({ message: error.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const debt = await debtService.update(req.user.id, req.params.id, req.body || {});
    if (!debt) return res.status(404).json({ message: 'Debt not found.' });
    return res.json(debt);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.post('/:id/archive', async (req, res) => {
  try {
    const result = await debtService.archive(req.user.id, req.params.id);
    if (result === null) return res.status(404).json({ message: 'Debt not found.' });
    if (!result) return res.status(409).json({ message: 'Debt is already archived.' });
    return res.status(204).send();
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.post('/:id/restore', async (req, res) => {
  try {
    const debt = await debtService.restore(req.user.id, req.params.id);
    if (debt === null) return res.status(404).json({ message: 'Debt not found.' });
    return res.json(debt);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await debtService.remove(req.user.id, req.params.id);
    if (deleted === null) return res.status(404).json({ message: 'Debt not found.' });
    return res.status(204).send();
  } catch (error) {
    const status = error.message.includes('payment history') ? 409 : 400;
    return res.status(status).json({ message: error.message });
  }
});

router.post('/:id/payments', async (req, res) => {
  try {
    const debt = await debtService.addPayment(req.user.id, req.params.id, req.body || {});
    if (!debt) return res.status(404).json({ message: 'Debt not found.' });
    return res.status(201).json(debt);
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

router.delete('/:id/payments/:paymentId', async (req, res) => {
  try {
    const result = await debtService.removePayment(req.user.id, req.params.id, req.params.paymentId);
    if (result === null) return res.status(404).json({ message: 'Debt not found.' });
    if (!result) return res.status(404).json({ message: 'Payment not found.' });
    return res.status(204).send();
  } catch (error) { return res.status(400).json({ message: error.message }); }
});

module.exports = router;
