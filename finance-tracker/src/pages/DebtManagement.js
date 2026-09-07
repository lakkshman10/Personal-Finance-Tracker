import React, { useEffect, useMemo, useState } from 'react';
import financeApi from '../services/financeApi';

// ============================================================
// Constants & Helpers
// ============================================================

const today = new Date().toISOString().slice(0, 10);

const blank = {
  name: '',
  principalAmount: '',
  outstandingAmount: '',
  interestRate: '',
  minimumPayment: '',
  dueDay: '',
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  })}`;

const statusText = (status) => {
  if (status === 'PAID_OFF') return 'Paid Off';
  if (status === 'ARCHIVED') return 'Archived';

  return 'Active';
};

// ============================================================
// Main Component
// ============================================================

export default function DebtManagement() {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [tab, setTab] = useState('ACTIVE');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const [payment, setPayment] = useState({
    amount: '',
    accountId: '',
    categoryId: '',
    paymentDate: today,
    description: '',
    notes: '',
  });

  const [openPayment, setOpenPayment] = useState(null);
  const [details, setDetails] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ----------------------------------------------------------
  // Data Loading
  // ----------------------------------------------------------

  const load = async () => {
    setLoading(true);

    try {
      const [debtsResponse, accountsResponse, categoriesResponse] =
        await Promise.all([
          financeApi.debts.list('ALL'),
          financeApi.accounts.list({ activeOnly: true }),
          financeApi.categories.list('EXPENSE'),
        ]);

      const debtData = debtsResponse.data || [];
      const accountData = accountsResponse.data || [];
      const categoryData = categoriesResponse.data || [];

      setDebts(debtData);
      setAccounts(accountData);
      setCategories(categoryData);

      setPayment((previous) => ({
        ...previous,
        accountId: accountData.some(
          (account) => account.id === previous.accountId
        )
          ? previous.accountId
          : accountData[0]?.id || '',
      }));
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to load debt data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ----------------------------------------------------------
  // Derived Data
  // ----------------------------------------------------------

  const counts = useMemo(
    () => ({
      ACTIVE: debts.filter((debt) => debt.status === 'ACTIVE').length,
      PAID_OFF: debts.filter((debt) => debt.status === 'PAID_OFF').length,
      ARCHIVED: debts.filter((debt) => debt.status === 'ARCHIVED').length,
    }),
    [debts]
  );

  const totals = useMemo(
    () =>
      debts.reduce(
        (result, debt) => ({
          principal:
            result.principal + Number(debt.principalAmount),
          outstanding:
            result.outstanding + Number(debt.outstandingAmount),
          paid: result.paid + Number(debt.paidAmount),
        }),
        {
          principal: 0,
          outstanding: 0,
          paid: 0,
        }
      ),
    [debts]
  );

  const visible = useMemo(
    () =>
      debts.filter(
        (debt) =>
          debt.status === tab &&
          debt.name.toLowerCase().includes(search.toLowerCase())
      ),
    [debts, tab, search]
  );

  // ----------------------------------------------------------
  // Debt Handlers
  // ----------------------------------------------------------

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await financeApi.debts.update(editing, form);
      } else {
        await financeApi.debts.create(form);
      }

      setForm(blank);
      setEditing(null);

      await load();
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to save debt.'
      );
    } finally {
      setSaving(false);
    }
  };

  const archive = async (debt) => {
    if (
      !window.confirm(
        `Archive “${debt.name}”? Payment history will be preserved.`
      )
    ) {
      return;
    }

    try {
      await financeApi.debts.archive(debt.id);
      await load();
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to archive debt.'
      );
    }
  };

  const restore = async (debt) => {
    if (!window.confirm(`Restore “${debt.name}”?`)) {
      return;
    }

    try {
      await financeApi.debts.restore(debt.id);
      await load();
      setTab('ACTIVE');
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to restore debt.'
      );
    }
  };

  const remove = async (debt) => {
    if (
      !window.confirm(
        `Permanently delete “${debt.name}”? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await financeApi.debts.remove(debt.id);
      setDetails(null);
      await load();
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to delete debt.'
      );
    }
  };

  // ----------------------------------------------------------
  // Payment Handlers
  // ----------------------------------------------------------

  const addPayment = async (event, debtId) => {
    event.preventDefault();
    setSaving(true);

    try {
      await financeApi.debts.addPayment(debtId, payment);

      setPayment((previous) => ({
        ...previous,
        amount: '',
        categoryId: '',
        paymentDate: today,
        description: '',
        notes: '',
      }));

      setOpenPayment(null);

      await load();
    } catch (error) {
      setError(
        error.response?.data?.message || 'Unable to record payment.'
      );
    } finally {
      setSaving(false);
    }
  };

  const reverse = async (debt, paymentRecord) => {
    if (
      !window.confirm(
        `Reverse ${money(paymentRecord.amount)} paid on ${paymentRecord.paymentDate}? The linked expense will also be removed.`
      )
    ) {
      return;
    }

    try {
      await financeApi.debts.removePayment(
        debt.id,
        paymentRecord.id
      );

      await load();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to reverse payment.'
      );
    }
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <main style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div>
          <h1 style={s.title}>Debt Management</h1>

          <p style={s.muted}>
            Track debts, repayments, progress and history.
          </p>
        </div>

        <button
          style={s.primary}
          onClick={() => {
            setEditing(null);
            setForm(blank);
          }}
        >
          + Add Debt
        </button>
      </header>

      {/* Error */}
      {error && (
        <div style={s.error}>
          {error}

          <button
            style={s.x}
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      {/* Summary */}
      <div style={s.summary}>
        <Stat
          t="Outstanding"
          v={money(totals.outstanding)}
        />

        <Stat
          t="Total Borrowed"
          v={money(totals.principal)}
        />

        <Stat
          t="Total Paid"
          v={money(totals.paid)}
        />

        <Stat
          t="Active Debts"
          v={counts.ACTIVE}
        />
      </div>

      {/* Main Layout */}
      <div style={s.layout}>
        {/* Debt Form */}
        <section style={s.panel}>
          <h2 style={s.h2}>
            {editing ? 'Edit Debt' : 'Add a Debt'}
          </h2>

          <p style={s.muted}>
            {editing
              ? 'Update debt details.'
              : 'Record original and current balances.'}
          </p>

          <form
            onSubmit={save}
            style={s.form}
          >
            {/* Keep your existing form fields here */}
          </form>
        </section>

        {/* Debt List */}
        <section style={s.panel}>
          <div style={s.listHead}>
            <div>
              <h2 style={s.h2}>Your Debts</h2>

              <p style={s.muted}>
                {debts.length} total records
              </p>
            </div>

            <input
              style={s.search}
              placeholder="Search debts…"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* Keep your existing tabs and DebtCard rendering here */}
        </section>
      </div>

      {/* Details Modal */}
      {details && (
        <div style={s.overlay}>
          {/* Keep existing modal content here */}
        </div>
      )}
    </main>
  );
}

// ============================================================
// Debt Card
// ============================================================

function DebtCard({
  d,
  open,
  setOpen,
  onDetails,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onPayment,
  accounts,
  categories,
  payment,
  setPayment,
  saving,
}) {
  // Keep existing DebtCard JSX here,
  // formatted into readable sections.
}

// ============================================================
// Reusable Components
// ============================================================

function Field({ l, children }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{l}</span>
      {children}
    </label>
  );
}

function Stat({ t, v }) {
  return (
    <div style={s.stat}>
      <span>{t}</span>
      <strong>{v}</strong>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const s = {
  page: {
    fontFamily: '"Rubik", sans-serif',
    maxWidth: 1280,
    margin: '0 auto',
    padding: '24px 20px 50px',
    color: '#263238',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 22,
  },

  title: {
    margin: 0,
    fontSize: 30,
  },

  muted: {
    margin: '5px 0',
    color: '#71808d',
    fontSize: 13,
  },

  // ... keep the remaining styles exactly as they are,
  // just formatted one property per line.
};