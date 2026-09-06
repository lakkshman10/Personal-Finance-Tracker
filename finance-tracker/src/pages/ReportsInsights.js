import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import financeApi from '../services/financeApi';

const formatCurrency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatShortCurrency = (value) => `₹ ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function ReportsInsights() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financeApi.reports.summary();
      setReport(response.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const pieData = useMemo(() => (report?.categories || []).slice(0, 6), [report]);

  const insight = useMemo(() => {
    if (!report) return '';
    const topCategory = report.categories?.[0];
    const current = report.currentMonth || { income: 0, expenses: 0, savings: 0 };
    if (topCategory && topCategory.amount > 0) {
      return `Your highest spending category is ${topCategory.name} at ${formatCurrency(topCategory.amount)} over the last six months.`;
    }
    if (current.income > current.expenses) return 'You are currently spending less than you earn this month. Keep the momentum going.';
    if (current.expenses > current.income) return 'Your expenses are currently higher than your income this month. Review your largest categories to find savings opportunities.';
    return 'Add more transactions to unlock stronger spending insights.';
  }, [report]);

  if (loading) return <div style={styles.container}><h1 style={styles.header}>Reports & Insights</h1><div style={styles.card}><p style={styles.muted}>Loading your financial report...</p></div></div>;

  if (error) return <div style={styles.container}><h1 style={styles.header}>Reports & Insights</h1><div style={styles.card}><p style={styles.error}>{error}</p><button onClick={loadReport} style={styles.primaryButton}>Try Again</button></div></div>;

  const totals = report?.totals || {};
  const currentMonth = report?.currentMonth || {};

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.header}>Reports & Insights</h1>
          <p style={styles.subtitle}>A six-month view of your income, spending and financial progress.</p>
        </div>
        <button onClick={loadReport} style={styles.refreshButton}>↻ Refresh</button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}><span style={styles.label}>Total Income</span><strong style={styles.income}>{formatCurrency(totals.income)}</strong></div>
        <div style={styles.summaryCard}><span style={styles.label}>Total Expenses</span><strong style={styles.expense}>{formatCurrency(totals.expenses)}</strong></div>
        <div style={styles.summaryCard}><span style={styles.label}>Net Savings</span><strong style={totals.savings >= 0 ? styles.savings : styles.expense}>{formatCurrency(totals.savings)}</strong></div>
        <div style={styles.summaryCard}><span style={styles.label}>Savings Rate</span><strong style={styles.primary}>{Number(totals.savingsRate || 0).toFixed(1)}%</strong></div>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <h2 style={styles.sectionTitle}>Income vs Expenses</h2>
          <div style={styles.chart}><ResponsiveContainer width="100%" height="100%"><BarChart data={report?.monthly || []} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis tickFormatter={formatShortCurrency}/><Tooltip formatter={(value) => formatCurrency(value)}/><Legend/><Bar dataKey="income" name="Income"/><Bar dataKey="expenses" name="Expenses"/></BarChart></ResponsiveContainer></div>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.sectionTitle}>Spending by Category</h2>
          {pieData.length ? <div style={styles.chart}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="amount" nameKey="name" cx="50%" cy="45%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{pieData.map((entry, index) => <Cell key={entry.name} fill={`hsl(${index * 55}, 55%, 55%)`} />)}</Pie><Tooltip formatter={(value) => formatCurrency(value)}/></PieChart></ResponsiveContainer></div> : <p style={styles.muted}>No expense data available yet.</p>}
        </section>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <h2 style={styles.sectionTitle}>Monthly Savings</h2>
          <div style={styles.monthList}>{(report?.monthly || []).map((month) => <div key={month.key} style={styles.monthRow}><span>{month.month}</span><strong style={month.savings >= 0 ? styles.savings : styles.expense}>{formatCurrency(month.savings)}</strong></div>)}</div>
        </section>

        <section style={styles.panel}>
          <h2 style={styles.sectionTitle}>Current Month</h2>
          <div style={styles.currentStats}><div><span style={styles.label}>Income</span><strong style={styles.income}>{formatCurrency(currentMonth.income)}</strong></div><div><span style={styles.label}>Expenses</span><strong style={styles.expense}>{formatCurrency(currentMonth.expenses)}</strong></div><div><span style={styles.label}>Savings</span><strong style={currentMonth.savings >= 0 ? styles.savings : styles.expense}>{formatCurrency(currentMonth.savings)}</strong></div></div>
          <div style={styles.insight}><strong>💡 Insight</strong><p>{insight}</p></div>
        </section>
      </div>

      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>Budget Performance</h2>
        {report?.budgetPerformance?.length ? <div style={styles.budgetList}>{report.budgetPerformance.map((budget) => <div key={budget.category} style={styles.budgetRow}><div style={styles.budgetTop}><span>{budget.category}</span><span>{formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}</span></div><div style={styles.progressTrack}><div style={{ ...styles.progressBar, width: `${Math.min(budget.progressPercent, 100)}%` }}/></div><small style={styles.muted}>{budget.remaining >= 0 ? `${formatCurrency(budget.remaining)} remaining` : `${formatCurrency(Math.abs(budget.remaining))} over budget`}</small></div>)}</div> : <p style={styles.muted}>No budgets have been created for the current month.</p>}
      </section>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Rubik, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  header: { margin: 0, color: '#4CAF50' }, subtitle: { margin: '7px 0 0', color: '#6c757d' },
  refreshButton: { padding: '9px 16px', border: '1px solid #ced4da', background: '#fff', borderRadius: '6px', cursor: 'pointer' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' },
  summaryCard: { background: '#f8f9fa', borderRadius: '8px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#6c757d', fontSize: '14px' }, income: { color: '#27AE60', fontSize: '20px' }, expense: { color: '#dc3545', fontSize: '20px' }, savings: { color: '#2980b9', fontSize: '20px' }, primary: { color: '#4CAF50', fontSize: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }, panel: { background: '#f8f9fa', borderRadius: '8px', padding: '20px' },
  sectionTitle: { margin: '0 0 15px', color: '#343a40', fontSize: '20px' }, chart: { height: '330px' }, muted: { color: '#6c757d', textAlign: 'center' }, error: { color: '#dc3545', marginBottom: '15px' }, card: { background: '#f8f9fa', borderRadius: '8px', padding: '30px', textAlign: 'center' }, primaryButton: { background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: 'pointer' },
  monthList: { display: 'flex', flexDirection: 'column' }, monthRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #dee2e6' }, currentStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }, currentStatsItem: { display: 'flex', flexDirection: 'column' }, insight: { marginTop: '20px', padding: '15px', background: '#E8F5E9', borderRadius: '8px' },
  budgetList: { display: 'flex', flexDirection: 'column', gap: '16px' }, budgetRow: { paddingBottom: '12px', borderBottom: '1px solid #dee2e6' }, budgetTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '7px', fontWeight: '500' }, progressTrack: { height: '9px', background: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }, progressBar: { height: '100%', background: '#4CAF50', borderRadius: '10px' },
};

export default ReportsInsights;
