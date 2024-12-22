const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authenticateToken = require('../middlewares/authMiddleware'); 

// Routes
router.post('/', authenticateToken, expenseController.addExpense);
router.get('/', authenticateToken, expenseController.getExpenses);
router.put('/:id', authenticateToken, expenseController.updateExpense);
router.delete('/:id', authenticateToken, expenseController.deleteExpense);
router.get('/trends', authenticateToken, expenseController.getMonthlyTrends);

module.exports = router;
