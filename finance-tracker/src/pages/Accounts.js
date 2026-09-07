import React, { useEffect, useMemo, useState } from 'react';
import financeApi from '../services/financeApi';

const ACCOUNT_TYPES = [
  ['BANK', 'Bank Account'],
  ['CASH', 'Cash'],
  ['CREDIT_CARD', 'Credit Card'],
  ['WALLET', 'Wallet'],
  ['UPI', 'UPI'],
  ['INVESTMENT', 'Investment'],
  ['OTHER', 'Other'],
];

const EMPTY_FORM = { name: '', type: 'BANK', institution: '', currency: 'INR', openingBalance: '0' };

const formatCurrency = (value, currency = 'INR') => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
};

const typeLabel = (type) => ACCOUNT_TYPES.find(([value]) => value === type)?.[1] || type;

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [accountsResponse, transactionsResponse] = await Promise.all([
        financeApi.accounts.list(),
        financeApi.transactions.list({ limit: 500 }),
      ]);
      setAccounts(accountsResponse.data || []);
      setTransactions(transactionsResponse.data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError(err.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const balances = useMemo(() => {
    const result = new Map();
    accounts.forEach((account) => result.set(account.id, Number(account.openingBalance || 0)));
    transactions.forEach((transaction) => {
      if (!result.has(transaction.accountId)) return;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === 'INCOME') result.set(transaction.accountId, result.get(transaction.accountId) + amount);
      if (transaction.type === 'EXPENSE') result.set(transaction.accountId, result.get(transaction.accountId) - amount);
      if (transaction.type === 'TRANSFER') {
        if (transaction.transferDirection === 'OUT') result.set(transaction.accountId, result.get(transaction.accountId) - amount);
        if (transaction.transferDirection === 'IN') result.set(transaction.accountId, result.get(transaction.accountId) + amount);
      }
    });
    return result;
  }, [accounts, transactions]);

  const totals = useMemo(() => accounts.reduce((sum, account) => sum + (balances.get(account.id) || 0), 0), [accounts, balances]);

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setError('');
      if (editingId) await financeApi.accounts.update(editingId, formData);
      else await financeApi.accounts.create(formData);
      resetForm(); await loadData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save account.'); }
    finally { setSaving(false); }
  };

  const editAccount = (account) => {
    setEditingId(account.id);
    setFormData({ name: account.name || '', type: account.type || 'BANK', institution: account.institution || '', currency: account.currency || 'INR', openingBalance: String(account.openingBalance ?? 0) });
    setShowForm(true);
  };

  const toggleActive = async (account) => {
    try { setError(''); await financeApi.accounts.update(account.id, { isActive: !account.isActive }); await loadData(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to update account.'); }
  };

  if (loading) return <div style={styles.container}><h1 style={styles.header}>Accounts</h1><div style={styles.panel}><p style={styles.muted}>Loading your accounts...</p></div></div>;

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}><div><h1 style={styles.header}>Accounts</h1><p style={styles.subtitle}>Manage the bank accounts, wallets and other places where you keep your money.</p></div><button style={styles.primaryButton} onClick={() => { resetForm(); setShowForm(true); }}>+ Add Account</button></div>
      {error && <div style={styles.errorBox}>{error}</div>}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}><span style={styles.label}>Total Accounts</span><strong style={styles.value}>{accounts.length}</strong></div>
        <div style={styles.summaryCard}><span style={styles.label}>Active Accounts</span><strong style={styles.value}>{accounts.filter((account) => account.isActive).length}</strong></div>
        <div style={styles.summaryCard}><span style={styles.label}>Combined Balance</span><strong style={totals >= 0 ? styles.income : styles.expense}>{formatCurrency(totals)}</strong></div>
      </div>
      {showForm && <section style={styles.panel}><div style={styles.formHeader}><h2 style={styles.sectionTitle}>{editingId ? 'Edit Account' : 'Add Account'}</h2><button style={styles.closeButton} onClick={resetForm}>Cancel</button></div><form onSubmit={handleSubmit} style={styles.formGrid}>
        <label style={styles.field}><span>Account Name</span><input required maxLength="120" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. ICICI Savings" /></label>
        <label style={styles.field}><span>Account Type</span><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>{ACCOUNT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label style={styles.field}><span>Bank / Institution</span><input maxLength="120" value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} placeholder="Optional" /></label>
        <label style={styles.field}><span>Currency</span><input required maxLength="3" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} /></label>
        <label style={styles.field}><span>Opening Balance</span><input required min="0" step="0.01" type="number" value={formData.openingBalance} onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })} /></label>
        <div style={styles.formActions}><button type="submit" disabled={saving} style={styles.primaryButton}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Account'}</button></div>
      </form></section>}
      <section style={styles.panel}><h2 style={styles.sectionTitle}>Your Accounts</h2>{accounts.length === 0 ? <div style={styles.empty}><p>No accounts yet.</p><button style={styles.primaryButton} onClick={() => setShowForm(true)}>Create your first account</button></div> : <div style={styles.accountGrid}>{accounts.map((account) => { const balance = balances.get(account.id) || 0; return <article key={account.id} style={{ ...styles.accountCard, opacity: account.isActive ? 1 : 0.62 }}><div style={styles.accountTop}><div><h3 style={styles.accountName}>{account.name}</h3><span style={styles.type}>{typeLabel(account.type)}{account.institution ? ` · ${account.institution}` : ''}</span></div><span style={account.isActive ? styles.active : styles.inactive}>{account.isActive ? 'Active' : 'Inactive'}</span></div><div style={styles.balance}>{formatCurrency(balance, account.currency)}</div><div style={styles.meta}>Opening balance: {formatCurrency(account.openingBalance, account.currency)}</div><div style={styles.actions}><button style={styles.secondaryButton} onClick={() => editAccount(account)}>Edit</button><button style={styles.secondaryButton} onClick={() => toggleActive(account)}>{account.isActive ? 'Deactivate' : 'Activate'}</button></div></article>; })}</div>}</section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '30px 24px 50px', fontFamily: 'Rubik, sans-serif' }, titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }, header: { margin: 0, color: '#1c2331', fontSize: '30px' }, subtitle: { margin: '8px 0 0', color: '#6b7280' }, summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }, summaryCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }, label: { display: 'block', color: '#6b7280', fontSize: '14px', marginBottom: '8px' }, value: { color: '#1c2331', fontSize: '24px' }, income: { color: '#00a884', fontSize: '24px' }, expense: { color: '#e05a5a', fontSize: '24px' }, panel: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }, sectionTitle: { margin: 0, color: '#1c2331', fontSize: '20px' }, formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }, field: { display: 'flex', flexDirection: 'column', gap: '7px', color: '#374151', fontSize: '14px' }, formActions: { display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }, primaryButton: { border: 'none', background: '#00a884', color: '#fff', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'Rubik, sans-serif', fontWeight: 500 }, secondaryButton: { border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontFamily: 'Rubik, sans-serif' }, closeButton: { border: 'none', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontFamily: 'Rubik, sans-serif' }, accountGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginTop: '18px' }, accountCard: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }, accountTop: { display: 'flex', justifyContent: 'space-between', gap: '12px' }, accountName: { margin: 0, color: '#1c2331', fontSize: '18px' }, type: { display: 'block', marginTop: '5px', color: '#6b7280', fontSize: '13px' }, active: { color: '#00a884', fontSize: '12px', fontWeight: 600 }, inactive: { color: '#9ca3af', fontSize: '12px', fontWeight: 600 }, balance: { marginTop: '24px', color: '#1c2331', fontSize: '28px', fontWeight: 600 }, meta: { marginTop: '6px', color: '#9ca3af', fontSize: '12px' }, actions: { display: 'flex', gap: '8px', marginTop: '18px' }, empty: { textAlign: 'center', padding: '35px 10px', color: '#6b7280' }, muted: { color: '#6b7280' }, errorBox: { background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' },
};

export default Accounts;
