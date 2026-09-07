const prisma = require('../config/prisma');

const reportRepository = {
  async findTransactions(userId, fromDate, toDate) {
    return prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: fromDate, lte: toDate }, type: { in: ['INCOME', 'EXPENSE'] } },
      select: { type: true, amount: true, transactionDate: true, category: { select: { id: true, name: true, type: true } } },
      orderBy: { transactionDate: 'asc' },
    });
  },
  async findBudgets(userId, fromDate, toDate = fromDate) {
    return prisma.budget.findMany({
      where: { userId, month: { gte: fromDate, lte: toDate } },
      select: { id: true, amount: true, alertPercent: true, month: true, category: { select: { id: true, name: true } } },
    });
  },
};
module.exports = reportRepository;
