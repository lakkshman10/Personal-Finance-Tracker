const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticateToken = require('../middlewares/authMiddleware'); 

router.post('/', authenticateToken, budgetController.postbudget);
router.get('/', authenticateToken, budgetController.getbudget);
router.put('/:id', authenticateToken, budgetController.updatedBudget);
router.delete('/:id', authenticateToken, budgetController.deletebudget);

module.exports = router;