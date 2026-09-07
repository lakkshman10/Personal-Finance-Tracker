const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const accountService = require('../services/accountService');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try { return res.json(await accountService.list(req.user.id, { activeOnly: req.query.activeOnly === 'true' })); } catch (error) { return next(error); }
});
router.post('/', async (req, res, next) => {
  try { return res.status(201).json(await accountService.create(req.user.id, req.body)); } catch (error) { return next(error); }
});
router.patch('/:id', async (req, res, next) => {
  try { const account = await accountService.update(req.user.id, req.params.id, req.body || {}); if (!account) return next(new AppError('Account not found.', 404)); return res.json(account); } catch (error) { return next(error); }
});
module.exports = router;
