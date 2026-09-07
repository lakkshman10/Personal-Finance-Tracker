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

  return (
    <div style={styles.dashboard}>
      <div style={styles.topSection}>
        <h2>Welcome, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}!</h2>
        <div style={styles.financialHealthSummary}><div style={styles.statCard}>{loading ? 'Loading financial summary...' : `You've saved ${formatCurrency(monthlySavings)} this month!`}</div></div>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <div style={styles.middleSection}>
        <div style={styles.chartContainer}><h3>Expense Breakdown</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={100}>{expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={getChartColor(index)} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /><Legend /></PieChart></ResponsiveContainer></div>
        <div style={styles.progressBarContainer}><h3>Monthly Savings</h3><p>Income: {formatCurrency(currentMonthIncome)}</p><p>Expenses: {formatCurrency(currentMonthExpenseTotal)}</p><ProgressBar now={currentMonthIncome > 0 ? Math.max(0, Math.min(100, (monthlySavings / currentMonthIncome) * 100)) : 0} label={currentMonthIncome > 0 ? `${Math.max(0, Math.round((monthlySavings / currentMonthIncome) * 100))}%` : '0%'} /></div>
        <div style={styles.budgetStatusContainer}><h3>Budget Status</h3><ResponsiveContainer width="100%" height={300}><LineChart data={budgetStatusData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => formatCurrency(value)} /><Legend /><Line type="monotone" dataKey="spent" /><Line type="monotone" dataKey="budget" /></LineChart></ResponsiveContainer></div>
      </div>
      <div style={styles.bottomSection}><h3>Budget Alerts</h3>{budgetAlerts.length ? budgetAlerts.map((budget) => <Alert key={`${budget.category}-${budget.budget}`} variant={budget.percent >= 100 ? 'danger' : 'warning'} style={styles.alert}>{budget.category} budget is at {budget.percent.toFixed(0)}% ({formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}).</Alert>) : <Alert variant="success" style={styles.alert}>No budget alerts right now.</Alert>}</div>
    </div>
  );
}
const getChartColor = (index) => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4];
const styles = { dashboard: { padding: '20px', backgroundColor: '#f4f4f4', fontFamily: 'Rubik' }, topSection: { marginBottom: '30px' }, financialHealthSummary: { display: 'flex', justifyContent: 'center', alignItems: 'center' }, statCard: { backgroundColor: '#2ecc71', color: 'white', padding: '20px', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }, middleSection: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' }, chartContainer: { width: '34%' }, progressBarContainer: { width: '32%' }, budgetStatusContainer: { width: '34%' }, bottomSection: { marginTop: '20px' }, alert: { marginBottom: '10px' } };
export default Dashboard;
