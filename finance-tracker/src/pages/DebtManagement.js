import React, { useEffect, useMemo, useState } from 'react';
import financeApi from '../services/financeApi';
import DebtForm from '../components/debt/DebtForm';
import DebtList from '../components/debt/DebtList';
import DebtDetailsModal from '../components/debt/DebtDetailsModal';
import DebtSummary from '../components/debt/DebtSummary';
import '../components/debt/debtManagement.css';

const today = new Date().toISOString().slice(0, 10);
const emptyDebt = { name: '', principalAmount: '', outstandingAmount: '', interestRate: '', minimumPayment: '', dueDay: '' };
const emptyPayment = { amount: '', accountId: '', categoryId: '', paymentDate: today, description: '', notes: '' };

export default function DebtManagement() {
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyDebt);
  const [editingId, setEditingId] = useState(null);
  const [payment, setPayment] = useState(emptyPayment);
  const [paymentDebtId, setPaymentDebtId] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [debtResponse, accountResponse, categoryResponse] = await Promise.all([
        financeApi.debts.list('ALL'),
        financeApi.accounts.list({ activeOnly: true }),
        financeApi.categories.list('EXPENSE'),
      ]);
      const nextAccounts = accountResponse.data || [];
      setDebts(debtResponse.data || []);
      setAccounts(nextAccounts);
      setCategories(categoryResponse.data || []);
      setPayment((current) => ({
        ...current,
        accountId: nextAccounts.some((account) => account.id === current.accountId)
          ? current.accountId
          : nextAccounts[0]?.id || '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load debt data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    ACTIVE: debts.filter((debt) => debt.status === 'ACTIVE').length,
    PAID_OFF: debts.filter((debt) => debt.status === 'PAID_OFF').length,
    ARCHIVED: debts.filter((debt) => debt.status === 'ARCHIVED').length,
  }), [debts]);

  const totals = useMemo(() => debts.reduce((result, debt) => ({
    principal: result.principal + Number(debt.principalAmount || 0),
    outstanding: result.outstanding + Number(debt.outstandingAmount || 0),
    paid: result.paid + Number(debt.paidAmount || 0),
  }), { principal: 0, outstanding: 0, paid: 0 }), [debts]);

  const visibleDebts = useMemo(() => debts.filter((debt) => (
    debt.status === activeTab && debt.name.toLowerCase().includes(search.toLowerCase())
  )), [debts, activeTab, search]);

  const resetDebtForm = () => {
    setForm(emptyDebt);
    setEditingId(null);
  };

  const saveDebt = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await financeApi.debts.update(editingId, form);
      else await financeApi.debts.create(form);
      resetDebtForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save debt.');
    } finally {
      setSaving(false);
    }
  };

  const editDebt = (debt) => {
    setEditingId(debt.id);
    setForm({
      name: debt.name,
      principalAmount: debt.principalAmount,
      outstandingAmount: '',
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment || '',
      dueDay: debt.dueDay || '',
    });
  };

  const archiveDebt = async (debt) => {
    if (!window.confirm(`Archive “${debt.name}”? Payment history will be preserved.`)) return;
    try {
      await financeApi.debts.archive(debt.id);
      if (details?.id === debt.id) setDetails(null);
      await load();
      setActiveTab('ARCHIVED');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive debt.');
    }
  };

  const restoreDebt = async (debt) => {
    if (!window.confirm(`Restore “${debt.name}”?`)) return;
    try {
      await financeApi.debts.restore(debt.id);
      setDetails(null);
      await load();
      setActiveTab(Number(debt.outstandingAmount) === 0 ? 'PAID_OFF' : 'ACTIVE');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to restore debt.');
    }
  };

  const deleteDebt = async (debt) => {
    if (!window.confirm(`Permanently delete “${debt.name}”? This cannot be undone.`)) return;
    try {
      await financeApi.debts.remove(debt.id);
      setDetails(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete debt.');
    }
  };

  const startPayment = (debt) => {
    setPaymentDebtId(debt.id);
    setPayment((current) => ({ ...emptyPayment, accountId: current.accountId || accounts[0]?.id || '' }));
  };

  const addPayment = async (event, debtId) => {
    event.preventDefault();
    setSaving(true);
    try {
      await financeApi.debts.addPayment(debtId, payment);
      setPayment(emptyPayment);
      setPaymentDebtId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const reversePayment = async (debt, paymentRecord) => {
    if (!window.confirm(`Reverse ₹${Number(paymentRecord.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} paid on ${paymentRecord.paymentDate}? The linked expense will also be removed.`)) return;
    try {
      await financeApi.debts.removePayment(debt.id, paymentRecord.id);
      setDetails(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reverse payment.');
    }
  };

  return (
    <main className="debt-page">
      <header className="debt-page__header">
        <div>
          <h1>Debt Management</h1>
          <p>Track debts, repayments, progress and history.</p>
        </div>
      </header>

      {error && <div className="debt-alert">{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}

      <DebtSummary totals={totals} activeCount={counts.ACTIVE} />

      <div className="debt-layout">
        <DebtForm
          form={form}
          editing={Boolean(editingId)}
          saving={saving}
          onChange={setForm}
          onSubmit={saveDebt}
          onCancel={resetDebtForm}
        />

        <DebtList
          debts={visibleDebts}
          total={debts.length}
          counts={counts}
          activeTab={activeTab}
          search={search}
          loading={loading}
          paymentDebtId={paymentDebtId}
          payment={payment}
          accounts={accounts}
          categories={categories}
          saving={saving}
          onTabChange={setActiveTab}
          onSearchChange={setSearch}
          onDetails={setDetails}
          onEdit={editDebt}
          onArchive={archiveDebt}
          onRestore={restoreDebt}
          onDelete={deleteDebt}
          onPaymentStart={startPayment}
          onPayment={addPayment}
          onPaymentChange={setPayment}
        />
      </div>

      {details && (
        <DebtDetailsModal
          debt={details}
          onClose={() => setDetails(null)}
          onRestore={restoreDebt}
          onDelete={deleteDebt}
          onReversePayment={reversePayment}
        />
      )}
    </main>
  );
}
