const reportRepository = require('../repositories/reportRepository');
const pad = (value) => String(value).padStart(2, '0');
const dateKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
const monthLabel = (date) => date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const endOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

const reportsService = {
  async summary(userId) {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const rangeEnd = endOfMonth(now);
    const transactions = await reportRepository.findTransactions(userId, sixMonthsAgo, rangeEnd);
    const budgets = await reportRepository.findBudgets(userId, sixMonthsAgo, rangeEnd);

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
      return { key: dateKey(date), month: monthLabel(date), income: 0, expenses: 0, savings: 0 };
    });
    const monthMap = new Map(months.map((month) => [month.key, month]));
    const categoryTotals = new Map();
    const currentExpenseCategories = new Map();
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const transactionMonth = dateKey(new Date(transaction.transactionDate));
      const month = monthMap.get(transactionMonth);
      if (transaction.type === 'INCOME') {
        totalIncome += amount;
        if (month) month.income += amount;
      } else if (transaction.type === 'EXPENSE') {
        totalExpenses += amount;
        if (month) month.expenses += amount;
        const categoryName = transaction.category?.name || 'Uncategorized';
        categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + amount);
        if (transactionMonth === dateKey(now)) currentExpenseCategories.set(categoryName, (currentExpenseCategories.get(categoryName) || 0) + amount);
      }
    });
    months.forEach((month) => { month.savings = month.income - month.expenses; });

    const budgetByMonth = new Map();
    budgets.forEach((budget) => {
      const key = dateKey(new Date(budget.month));
      if (!budgetByMonth.has(key)) budgetByMonth.set(key, { month: key, budget: 0, spent: 0 });
      budgetByMonth.get(key).budget += Number(budget.amount);
      const spent = transactions
        .filter((transaction) => transaction.type === 'EXPENSE' && dateKey(new Date(transaction.transactionDate)) === key && transaction.category?.id === budget.category?.id)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      budgetByMonth.get(key).spent += spent;
    });
    const budgetStatus = Array.from(budgetByMonth.values()).sort((a, b) => a.month.localeCompare(b.month));

    const currentBudgets = budgets.filter((budget) => dateKey(new Date(budget.month)) === dateKey(now));
    const budgetPerformance = currentBudgets.map((budget) => {
      const spent = transactions.filter((transaction) => transaction.type === 'EXPENSE' && new Date(transaction.transactionDate) >= currentMonthStart && new Date(transaction.transactionDate) <= rangeEnd && transaction.category?.id === budget.category?.id).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const budgetAmount = Number(budget.amount);
      return { category: budget.category?.name || 'Uncategorized', budget: budgetAmount, spent, remaining: budgetAmount - spent, progressPercent: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0, alertPercent: Number(budget.alertPercent || 80) };
    }).sort((a, b) => b.progressPercent - a.progressPercent);

    const categories = Array.from(categoryTotals.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    const currentMonth = months[months.length - 1];
    return {
      range: { from: sixMonthsAgo.toISOString().slice(0, 10), to: rangeEnd.toISOString().slice(0, 10) },
      totals: { income: totalIncome, expenses: totalExpenses, savings: totalIncome - totalExpenses, savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0 },
      monthly: months,
      categories,
      currentMonthCategories: Array.from(currentExpenseCategories.entries()).map(([name, value]) => ({ name, value })),
      budgetPerformance,
      budgetStatus,
      transactionCount: transactions.length,
      currentMonth,
    };
  },
};
module.exports = reportsService;
