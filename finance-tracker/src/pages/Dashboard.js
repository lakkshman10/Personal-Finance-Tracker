import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProgressBar, Alert } from 'react-bootstrap';
import financeApi from '../services/financeApi';

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const now = new Date();
        const monthKeys = [];
        for (let offset = 3; offset >= 0; offset -= 1) {
          const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
          monthKeys.push(date.toISOString().slice(0, 10));
        }

        const [transactionResponse, ...budgetResponses] = await Promise.all([
          financeApi.transactions.list({ limit: 500 }),
          ...monthKeys.map((month) => financeApi.budgets.list(month)),
        ]);

        setTransactions(transactionResponse.data || []);
        setBudgets(budgetResponses.flatMap((response) => response.data || []));
      } catch (loadError) {
        console.error('Error loading dashboard:', loadError);
        setError(loadError.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return transactions.filter((transaction) => {
      const date = new Date(transaction.transactionDate);
      return transaction.type === 'EXPENSE' &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCFullYear() === now.getUTCFullYear();
    });
  }, [transactions]);

  const currentMonthIncome = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.transactionDate);
        return transaction.type === 'INCOME' &&
          date.getUTCMonth() === now.getUTCMonth() &&
          date.getUTCFullYear() === now.getUTCFullYear();
      })
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }, [transactions]);

  const currentMonthExpenseTotal = currentMonthExpenses.reduce(
    (sum, transaction) => sum + Number(transaction.amount), 0
  );
  const monthlySavings = currentMonthIncome - currentMonthExpenseTotal;

  const expenseData = useMemo(() => {
    const totals = currentMonthExpenses.reduce((acc, transaction) => {
      const category = transaction.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(transaction.amount);
      return acc;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [currentMonthExpenses]);

  const budgetStatusData = useMemo(() => {
    const grouped = budgets.reduce((acc, budget) => {
      const key = budget.month?.slice(0, 7) || '';
      if (!key) return acc;
      if (!acc[key]) acc[key] = { month: key, budget: 0, spent: 0 };
      acc[key].budget += Number(budget.amount);

      const monthSpent = transactions.reduce((sum, transaction) => {
        const transactionMonth = transaction.transactionDate?.slice(0, 7);
        if (transaction.type === 'EXPENSE' && transactionMonth === key && transaction.categoryId === budget.categoryId) {
          return sum + Number(transaction.amount);
        }
        return sum;
      }, 0);
      acc[key].spent += monthSpent;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [budgets, transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets
      .map((budget) => {
        const month = budget.month?.slice(0, 7);
        const spent = transactions.reduce((sum, transaction) => {
          if (transaction.type === 'EXPENSE' && transaction.transactionDate?.slice(0, 7) === month && transaction.categoryId === budget.categoryId) {
            return sum + Number(transaction.amount);
          }
          return sum;
        }, 0);
        const threshold = Number(budget.alertPercent || 80);
        const percent = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0;
        return { budget, spent, threshold, percent };
      })
      .filter((item) => item.percent >= item.threshold)
      .slice(0, 3);
  }, [budgets, transactions]);

  const formatCurrency = (value) => `₹ ${Number(value).toFixed(2)}`;

  return (
    <div style={styles.dashboard}>
      <div style={styles.topSection}>
        <h2>Welcome, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}!</h2>
        <div style={styles.financialHealthSummary}>
          <div style={styles.statCard}>
            {loading ? 'Loading financial summary...' : `You've saved ${formatCurrency(monthlySavings)} this month!`}
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div style={styles.middleSection}>
        <div style={styles.chartContainer}>
          <h3>Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={100}>
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.progressBarContainer}>
          <h3>Monthly Savings</h3>
          <p>Income: {formatCurrency(currentMonthIncome)}</p>
          <p>Expenses: {formatCurrency(currentMonthExpenseTotal)}</p>
          <ProgressBar
            now={currentMonthIncome > 0 ? Math.max(0, Math.min(100, (monthlySavings / currentMonthIncome) * 100)) : 0}
            label={currentMonthIncome > 0 ? `${Math.max(0, Math.round((monthlySavings / currentMonthIncome) * 100))}%` : '0%'}
          />
        </div>

        <div style={styles.budgetStatusContainer}>
          <h3>Budget Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="spent" />
              <Line type="monotone" dataKey="budget" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.bottomSection}>
        <h3>Budget Alerts</h3>
        {budgetAlerts.length ? budgetAlerts.map(({ budget, spent, percent }) => (
          <Alert key={budget.id} variant={percent >= 100 ? 'danger' : 'warning'} style={styles.alert}>
            {budget.category?.name || 'Category'} budget is at {percent.toFixed(0)}% ({formatCurrency(spent)} of {formatCurrency(budget.amount)}).
          </Alert>
        )) : (
          <Alert variant="success" style={styles.alert}>No budget alerts right now.</Alert>
        )}
      </div>
    </div>
  );
}

const getChartColor = (index) => {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return colors[index % colors.length];
};

const styles = {
  dashboard: { padding: '20px', backgroundColor: '#f4f4f4', fontFamily: 'Rubik' },
  topSection: { marginBottom: '30px' },
  financialHealthSummary: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  statCard: { backgroundColor: '#2ecc71', color: 'white', padding: '20px', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
  middleSection: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' },
  chartContainer: { width: '34%' },
  progressBarContainer: { width: '32%' },
  budgetStatusContainer: { width: '34%' },
  bottomSection: { marginTop: '20px' },
  alert: { marginBottom: '10px' },
};

export default Dashboard;
