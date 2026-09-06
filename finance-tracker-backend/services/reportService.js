const reportRepository = require('../repositories/reportRepository');

const pad = (value) => String(value).padStart(2, '0');
const dateKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
const monthLabel = (date) => date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const endOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

const reportsService = {
  async summary(userId) {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const rangeEnd = endOfMonth(now);

    const transactions = await reportRepository.findTransactions(userId, sixMonthsAgo, rangeEnd);
    const budgets = await reportRepository.findBudgets(userId, currentMonth);

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
      return { key: dateKey(date), month: monthLabel(date), income: 0, expenses: 0, savings: 0 };
    });
    const monthMap = new Map(months.map((month) => [month.key, month]));
    const categoryTotals = new Map();

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const key = dateKey(new Date(transaction.transactionDate));
      const month = monthMap.get(key);

      if (transaction.type === 'INCOME') {
        totalIncome += amount;
        if (month) month.income += amount;
      } else {
        totalExpenses += amount;
        if (month) month.expenses += amount;
        const categoryName = transaction.category?.name || 'Uncategorized';
        categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + amount);
      }
    });

    months.forEach((month) => { month.savings = month.income - month.expenses; });

    const categories = Array.from(categoryTotals.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const currentMonth = months[months.length - 1];
    const budgetPerformance = budgets.map((budget) => {
      const spent = transactions
        .filter((transaction) => transaction.type === 'EXPENSE'
          && new Date(transaction.transactionDate) >= currentMonthStart(now)
          && new Date(transaction.transactionDate) <= rangeEnd
          && transaction.category?.id === budget.category?.id)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const budgetAmount = Number(budget.amount);
      return {
        category: budget.category?.name || 'Uncategorized',
        budget: budgetAmount,
        spent,
        remaining: budgetAmount - spent,
        progressPercent: budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0,
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);

    return {
      range: { from: sixMonthsAgo.toISOString().slice(0, 10), to: rangeEnd.toISOString().slice(0, 10) },
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      },
      monthly: months,
      categories,
      budgetPerformance,
      transactionCount: transactions.length,
      currentMonth,
    };
  },
};

function currentMonthStart(date) {
  return startOfMonth(date);
}

module.exports = reportsService;
