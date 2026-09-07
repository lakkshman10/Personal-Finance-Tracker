import React from 'react';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const statusText = (status) => status === 'PAID_OFF' ? 'Paid Off' : status === 'ARCHIVED' ? 'Archived' : 'Active';

export default function DebtDetailsModal({ debt, onClose, onRestore, onDelete, onReversePayment }) {
  return <div className="debt-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="debt-modal">
      <div className="debt-modal__head"><div><h2>{debt.name}</h2><span className="debt-badge">{statusText(debt.status)}</span></div><button className="debt-close" onClick={onClose} aria-label="Close">×</button></div>
      <div className="debt-detail-grid"><div><span>Principal</span><strong>{money(debt.principalAmount)}</strong></div><div><span>Paid</span><strong>{money(debt.paidAmount)}</strong></div><div><span>Outstanding</span><strong>{money(debt.outstandingAmount)}</strong></div></div>
      <h3>Payment History</h3>
      {!debt.payments?.length ? <p className="debt-empty">No payments recorded.</p> : debt.payments.map((payment) => <div className="debt-payment-row" key={payment.id}><div><b>{money(payment.amount)}</b><small>{payment.paymentDate} • {payment.transaction?.account?.name || 'Account'}{payment.transaction?.category?.name ? ` • ${payment.transaction.category.name}` : ''}</small></div>{debt.status !== 'ARCHIVED' && <button className="debt-btn debt-btn--delete" onClick={() => onReversePayment(debt, payment)}>Reverse</button>}</div>)}
      {debt.status === 'ARCHIVED' && <div className="debt-actions debt-modal-actions"><button className="debt-btn debt-btn--primary" onClick={() => onRestore(debt)}>Restore</button><button className="debt-btn debt-btn--delete" onClick={() => onDelete(debt)}>Delete</button></div>}
    </div>
  </div>;
}
