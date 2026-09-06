const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const savingsGoalService = require('../services/savingsGoalService');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    res.json(await savingsGoalService.list(req.user.id));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await savingsGoalService.create(req.user.id, req.body || {}));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const goal = await savingsGoalService.update(req.user.id, req.params.id, req.body || {});
    if (!goal) return res.status(404).json({ message: 'Savings goal not found.' });
    return res.json(goal);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await savingsGoalService.remove(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Savings goal not found.' });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post('/:id/contributions', async (req, res) => {
  try {
    const goal = await savingsGoalService.addContribution(req.user.id, req.params.id, req.body || {});
    if (!goal) return res.status(404).json({ message: 'Savings goal not found.' });
    return res.status(201).json(goal);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete('/contributions/:contributionId', async (req, res) => {
  try {
    const deleted = await savingsGoalService.removeContribution(req.user.id, req.params.contributionId);
    if (!deleted) return res.status(404).json({ message: 'Contribution not found.' });
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
