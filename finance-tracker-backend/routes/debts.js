const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const debtService = require('../services/debtService');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { return res.json(await debtService.list(req.user.id)); }
  catch (error) { return res.status(400).json({ message: error.message }); }
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

router.delete('/:id', async (req, res) => {
  try {
    const archived = await debtService.archive(req.user.id, req.params.id);
    if (!archived) return res.status(404).json({ message: 'Debt not found.' });
    return res.status(204).send();
  } catch (error) { return res.status(400).json({ message: error.message }); }
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
