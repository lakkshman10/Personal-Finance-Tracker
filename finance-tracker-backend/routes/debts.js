const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const debtService = require('../services/debtService');
const AppError = require('../utils/AppError');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res, next) => { try { const allowed = ['ACTIVE', 'PAID_OFF', 'ARCHIVED']; const requested = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ACTIVE'; const status = requested === 'ALL' ? undefined : requested; if (status && !allowed.includes(status)) return next(new AppError('Invalid debt status filter.')); return res.json(await debtService.list(req.user.id, status)); } catch (error) { return next(error); } });
router.post('/', async (req, res, next) => { try { return res.status(201).json(await debtService.create(req.user.id, req.body || {})); } catch (error) { return next(error); } });
router.patch('/:id', async (req, res, next) => { try { const debt = await debtService.update(req.user.id, req.params.id, req.body || {}); if (!debt) return next(new AppError('Debt not found.', 404)); return res.json(debt); } catch (error) { return next(error); } });
router.post('/:id/archive', async (req, res, next) => { try { const result = await debtService.archive(req.user.id, req.params.id); if (result === null) return next(new AppError('Debt not found.', 404)); return res.status(204).send(); } catch (error) { return next(error); } });
router.post('/:id/restore', async (req, res, next) => { try { const debt = await debtService.restore(req.user.id, req.params.id); if (debt === null) return next(new AppError('Debt not found.', 404)); return res.json(debt); } catch (error) { return next(error); } });
router.delete('/:id', async (req, res, next) => { try { const deleted = await debtService.remove(req.user.id, req.params.id); if (deleted === null) return next(new AppError('Debt not found.', 404)); return res.status(204).send(); } catch (error) { return next(error); } });
router.post('/:id/payments', async (req, res, next) => { try { const debt = await debtService.addPayment(req.user.id, req.params.id, req.body || {}); if (!debt) return next(new AppError('Debt not found.', 404)); return res.status(201).json(debt); } catch (error) { return next(error); } });
router.delete('/:id/payments/:paymentId', async (req, res, next) => { try { const result = await debtService.removePayment(req.user.id, req.params.id, req.params.paymentId); if (result === null) return next(new AppError('Debt not found.', 404)); if (!result) return next(new AppError('Payment not found.', 404)); return res.status(204).send(); } catch (error) { return next(error); } });
module.exports = router;
