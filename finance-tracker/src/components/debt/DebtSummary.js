import React from 'react';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function DebtSummary({ totals, activeCount }) {
  const items = [
    ['Outstanding', money(totals.outstanding)],
    ['Total Borrowed', money(totals.principal)],
    ['Total Paid', money(totals.paid)],
    ['Active Debts', activeCount],
  ];

  return <div className="debt-summary">{items.map(([label, value]) => <div className="debt-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
