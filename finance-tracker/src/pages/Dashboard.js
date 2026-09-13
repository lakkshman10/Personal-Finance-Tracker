import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ProgressBar, Alert } from 'react-bootstrap';
import financeApi from '../services/financeApi';

function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true); setError('');
        const response = await financeApi.reports.summary();
        setSummary(response.data || null);
      } catch (loadError) {
        console.error('Error loading dashboard:', loadError);
        setError(loadError.response?.data?.message || 'Unable to load dashboard data.');
      } finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  const currentMonthIncome = Number(summary?.currentMonth?.income || 0);
  const currentMonthExpenseTotal = Number(summary?.currentMonth?.expenses || 0);
  const monthlySavings = Number(summary?.currentMonth?.savings || 0);
  const expenseData = summary?.currentMonthCategories || [];
  const budgetStatusData = summary?.budgetStatus || [];
  const budgetAlerts = (summary?.budgetPerformance || [])
    .map((budget) => ({ ...budget, percent: Number(budget.progressPercent || 0), threshold: Number(budget.alertPercent || 80) }))
    .filter((item) => item.percent >= item.threshold)
    .slice(0, 3);
  const formatCurrency = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

  const savingsPercent = currentMonthIncome > 0
    ? Math.max(0, Math.min(100, (monthlySavings / currentMonthIncome) * 100))
    : 0;

  return (
    <div className="expensemate-page dashboard-page">
      <header className="expensemate-page-header">
        <div>
          <h1 className="expensemate-page-title">
            Welcome, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}!
          </h1>
          <p className="expensemate-page-subtitle">Here&apos;s your financial overview for the current month.</p>
        </div>
      </header>

      <section className="expensemate-stat-grid dashboard-summary-grid">
        <div className="expensemate-stat-card dashboard-highlight-card">
          <p className="expensemate-stat-label">Monthly Savings</p>
          <p className="expensemate-stat-value">{loading ? 'Loading...' : formatCurrency(monthlySavings)}</p>
          <span className="dashboard-highlight-text">Saved this month</span>
        </div>
        <div className="expensemate-stat-card">
          <p className="expensemate-stat-label">Monthly Income</p>
          <p className="expensemate-stat-value">{formatCurrency(currentMonthIncome)}</p>
        </div>
        <div className="expensemate-stat-card">
          <p className="expensemate-stat-label">Monthly Expenses</p>
          <p className="expensemate-stat-value">{formatCurrency(currentMonthExpenseTotal)}</p>
        </div>
        <div className="expensemate-stat-card">
          <p className="expensemate-stat-label">Savings Rate</p>
          <p className="expensemate-stat-value">{Math.round(savingsPercent)}%</p>
        </div>
      </section>

      {error && <Alert variant="danger">{error}</Alert>}

      <section className="dashboard-chart-grid">
        <div className="expensemate-panel dashboard-chart-panel">
          <h2 className="expensemate-section-title">Expense Breakdown</h2>
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

        <div className="expensemate-panel dashboard-savings-panel">
          <h2 className="expensemate-section-title">Monthly Savings</h2>
          <div className="dashboard-savings-details">
            <p><span>Income</span><strong>{formatCurrency(currentMonthIncome)}</strong></p>
            <p><span>Expenses</span><strong>{formatCurrency(currentMonthExpenseTotal)}</strong></p>
            <p><span>Saved</span><strong>{formatCurrency(monthlySavings)}</strong></p>
          </div>
          <ProgressBar
            now={savingsPercent}
            label={`${Math.round(savingsPercent)}%`}
          />
          <p className="dashboard-progress-caption">Percentage of income retained as savings.</p>
        </div>

        <div className="expensemate-panel dashboard-chart-panel">
          <h2 className="expensemate-section-title">Budget Status</h2>
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
      </section>

      <section className="expensemate-panel dashboard-alerts-panel">
        <h2 className="expensemate-section-title">Budget Alerts</h2>
        {budgetAlerts.length ? budgetAlerts.map((budget) => (
          <Alert
            key={`${budget.category}-${budget.budget}`}
            variant={budget.percent >= 100 ? 'danger' : 'warning'}
            className="dashboard-alert"
          >
            {budget.category} budget is at {budget.percent.toFixed(0)}% ({formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}).
          </Alert>
        )) : (
          <Alert variant="success" className="dashboard-alert">
            No budget alerts right now.
          </Alert>
        )}
      </section>
    </div>
  );
}

const getChartColor = (index) => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4];

export default Dashboard;
