import React from 'react';

function Field({ label, children }) {
  return <label className="debt-field"><span>{label}</span>{children}</label>;
}

export default function DebtForm({ form, editing, saving, onChange, onSubmit, onCancel }) {
  const update = (key, value) => onChange({ ...form, [key]: value });

  return <section className="debt-panel debt-form-panel">
    <h2>{editing ? 'Edit Debt' : 'Add a Debt'}</h2>
    <p>Record original and current balances.</p>
    <form onSubmit={onSubmit} className="debt-form">
      <Field label="Debt name"><input value={form.name} placeholder="e.g. Home Loan" onChange={(e) => update('name', e.target.value)} required /></Field>
      <div className="debt-form-grid">
        <Field label="Principal"><input type="number" min="0.01" step="0.01" value={form.principalAmount} onChange={(e) => update('principalAmount', e.target.value)} required /></Field>
        <Field label="Current outstanding"><input type="number" min="0" step="0.01" value={form.outstandingAmount} disabled={editing} placeholder={editing ? 'Managed by payments' : 'Same as principal'} onChange={(e) => update('outstandingAmount', e.target.value)} /></Field>
      </div>
      <div className="debt-form-grid">
        <Field label="Interest rate (%)"><input type="number" min="0" max="100" step="0.0001" value={form.interestRate} onChange={(e) => update('interestRate', e.target.value)} /></Field>
        <Field label="Minimum payment"><input type="number" min="0.01" step="0.01" value={form.minimumPayment} onChange={(e) => update('minimumPayment', e.target.value)} /></Field>
      </div>
      <Field label="Due day"><input type="number" min="1" max="31" value={form.dueDay} placeholder="Optional" onChange={(e) => update('dueDay', e.target.value)} /></Field>
      <div className="debt-form-actions"><button className="debt-btn debt-btn--primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Debt'}</button>{editing && <button type="button" className="debt-btn debt-btn--secondary" onClick={onCancel}>Cancel</button>}</div>
    </form>
  </section>;
}
