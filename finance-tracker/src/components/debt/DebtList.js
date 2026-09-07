import React from 'react';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const statusText = (status) => status === 'PAID_OFF' ? 'Paid Off' : status === 'ARCHIVED' ? 'Archived' : 'Active';

function Field({ label, children }) { return <label className="debt-field"><span>{label}</span>{children}</label>; }

function PaymentForm({ debt, payment, accounts, categories, saving, onChange, onSubmit }) {
  const update = (key, value) => onChange({ ...payment, [key]: value });
  return <form className="debt-payment" onSubmit={(event) => onSubmit(event, debt.id)}>
    <h4>Record repayment</h4>
    <div className="debt-form-grid">
      <Field label="Amount"><input type="number" min="0.01" max={debt.outstandingAmount} step="0.01" value={payment.amount} onChange={(e) => update('amount', e.target.value)} required /></Field>
      <Field label="Paid from"><select value={payment.accountId} onChange={(e) => update('accountId', e.target.value)} required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></Field>
    </div>
    {!accounts.length && <p className="debt-warning">No active financial account. Create or activate one first.</p>}
    <div className="debt-form-grid">
      <Field label="Expense category"><select value={payment.categoryId} onChange={(e) => update('categoryId', e.target.value)}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
      <Field label="Payment date"><input type="date" max={new Date().toISOString().slice(0, 10)} value={payment.paymentDate} onChange={(e) => update('paymentDate', e.target.value)} required /></Field>
    </div>
    <Field label="Description"><input value={payment.description} onChange={(e) => update('description', e.target.value)} /></Field>
    <button className="debt-btn debt-btn--primary" disabled={saving || !accounts.length}>{saving ? 'Recording…' : 'Record Payment'}</button>
  </form>;
}

function DebtCard({ debt, paymentOpen, payment, accounts, categories, saving, onDetails, onEdit, onArchive, onRestore, onDelete, onPaymentStart, onPayment, onPaymentChange }) {
  const progress = Math.min(100, Math.max(0, Number(debt.progressPercent || 0)));
  return <article className="debt-card">
    <div className="debt-card__head"><div><h3>{debt.name}</h3><span className="debt-badge">{statusText(debt.status)}</span></div><strong>{money(debt.outstandingAmount)}</strong></div>
    <div className="debt-progress-label"><span>{progress}% paid</span><span>{money(debt.paidAmount)} of {money(debt.principalAmount)}</span></div>
    <div className="debt-progress"><div style={{ width: `${progress}%` }} /></div>
    <p className="debt-meta">{Number(debt.interestRate || 0).toFixed(2)}% interest{debt.minimumPayment ? ` • Min ${money(debt.minimumPayment)}` : ''}{debt.dueDay ? ` • Due day ${debt.dueDay}` : ''}</p>
    <div className="debt-actions"><button className="debt-btn debt-btn--secondary" onClick={onDetails}>Details</button>{debt.status === 'ACTIVE' && <><button className="debt-btn debt-btn--primary" onClick={() => onPaymentStart(debt)}>{paymentOpen ? 'Close' : 'Make Payment'}</button><button className="debt-btn debt-btn--secondary" onClick={onEdit}>Edit</button><button className="debt-btn debt-btn--archive" onClick={onArchive}>Archive</button></>}{debt.status === 'PAID_OFF' && <button className="debt-btn debt-btn--archive" onClick={onArchive}>Archive</button>}{debt.status === 'ARCHIVED' && <><button className="debt-btn debt-btn--primary" onClick={onRestore}>Restore</button><button className="debt-btn debt-btn--delete" onClick={onDelete}>Delete</button></>}</div>
    {paymentOpen && <PaymentForm debt={debt} payment={payment} accounts={accounts} categories={categories} saving={saving} onChange={onPaymentChange} onSubmit={onPayment} />}
  </article>;
}

export default function DebtList({ debts, total, counts, activeTab, search, loading, paymentDebtId, payment, accounts, categories, saving, onTabChange, onSearchChange, onDetails, onEdit, onArchive, onRestore, onDelete, onPaymentStart, onPayment, onPaymentChange }) {
  return <section className="debt-panel debt-list-panel">
    <div className="debt-list-head"><div><h2>Your Debts</h2><p>{total} total records</p></div><input className="debt-search" placeholder="Search debts…" value={search} onChange={(e) => onSearchChange(e.target.value)} /></div>
    <div className="debt-tabs">{[['ACTIVE', 'Active'], ['PAID_OFF', 'Paid Off'], ['ARCHIVED', 'Archived']].map(([value, label]) => <button key={value} className={activeTab === value ? 'is-active' : ''} onClick={() => onTabChange(value)}>{label} ({counts[value]})</button>)}</div>
    {loading ? <p className="debt-empty">Loading…</p> : !debts.length ? <p className="debt-empty">No {statusText(activeTab).toLowerCase()} debts.</p> : debts.map((debt) => <DebtCard key={debt.id} debt={debt} paymentOpen={paymentDebtId === debt.id} payment={payment} accounts={accounts} categories={categories} saving={saving} onDetails={() => onDetails(debt)} onEdit={() => onEdit(debt)} onArchive={() => onArchive(debt)} onRestore={() => onRestore(debt)} onDelete={() => onDelete(debt)} onPaymentStart={onPaymentStart} onPayment={onPayment} onPaymentChange={onPaymentChange} />)}
  </section>;
}
