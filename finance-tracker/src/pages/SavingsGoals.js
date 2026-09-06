import React, { useEffect, useMemo, useState } from 'react';
import financeApi from '../services/financeApi';

const today = new Date().toISOString().slice(0, 10);

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', description: '' });
  const [contribution, setContribution] = useState({ amount: '', contributionDate: today, note: '' });

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financeApi.savingsGoals.list();
      setGoals(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGoals(); }, []);

  const totals = useMemo(() => goals.reduce((acc, goal) => ({
    target: acc.target + Number(goal.targetAmount),
    saved: acc.saved + Number(goal.currentSaved),
  }), { target: 0, saved: 0 }), [goals]);

  const resetForm = () => {
    setForm({ name: '', targetAmount: '', targetDate: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      if (editingId) await financeApi.savingsGoals.update(editingId, form);
      else await financeApi.savingsGoals.create(form);
      resetForm();
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the savings goal.');
    }
  };

  const startEdit = (goal) => {
    setEditingId(goal.id);
    setForm({ name: goal.name, targetAmount: goal.targetAmount, targetDate: goal.targetDate || '', description: goal.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal? Its contribution history will also be removed.')) return;
    try {
      setError('');
      await financeApi.savingsGoals.remove(id);
      if (selectedGoalId === id) setSelectedGoalId(null);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete the savings goal.');
    }
  };

  const addContribution = async (event, goalId) => {
    event.preventDefault();
    try {
      setError('');
      await financeApi.savingsGoals.addContribution(goalId, contribution);
      setContribution({ amount: '', contributionDate: today, note: '' });
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add the contribution.');
    }
  };

  const deleteContribution = async (contributionId) => {
    if (!window.confirm('Delete this contribution?')) return;
    try {
      setError('');
      await financeApi.savingsGoals.removeContribution(contributionId);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete the contribution.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Savings Goals</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}><span>Total Goals</span><strong>{goals.length}</strong></div>
        <div style={styles.summaryCard}><span>Total Target</span><strong>₹{totals.target.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
        <div style={styles.summaryCard}><span>Total Saved</span><strong>₹{totals.saved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
      </div>

      <div style={styles.topSection}>
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionHeader}>{editingId ? 'Edit Goal' : 'Create Goal'}</h2>
          <form style={styles.form} onSubmit={handleSubmit}>
            <label style={styles.label}>Goal Name</label>
            <input style={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Laptop" maxLength={120} required />
            <label style={styles.label}>Target Amount</label>
            <input style={styles.input} type="number" min="0.01" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="50000" required />
            <label style={styles.label}>Target Date</label>
            <input style={styles.input} type="date" min={today} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details" />
            <div style={styles.buttonflex}>
              <button style={styles.button} type="submit">{editingId ? 'Update Goal' : 'Create Goal'}</button>
              {editingId && <button style={styles.resetButton} type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        <div style={styles.rightColumn}>
          <h2 style={styles.sectionHeader}>Your Goals</h2>
          <div style={styles.scrollableContainer}>
            {loading ? <p style={styles.noDataText}>Loading goals...</p> : goals.length === 0 ? <p style={styles.noDataText}>No savings goals yet. Create your first goal.</p> : goals.map((goal) => (
              <div key={goal.id} style={styles.goalCard}>
                <div style={styles.goalHeader}>
                  <div><h3 style={styles.goalName}>{goal.name}</h3><span style={styles.status}>{goal.status.replace('_', ' ')}</span></div>
                  <div style={styles.actions}><button style={styles.editButton} onClick={() => startEdit(goal)}>Edit</button><button style={styles.deleteButton} onClick={() => deleteGoal(goal.id)}>Delete</button></div>
                </div>
                <div style={styles.amountRow}><strong>₹{Number(goal.currentSaved).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong><span>of ₹{Number(goal.targetAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${goal.progressPercent}%` }} /></div>
                <div style={styles.metaRow}><span>{goal.progressPercent}% saved</span><span>{Number(goal.remainingAmount) > 0 ? `₹${Number(goal.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining` : 'Target reached!'}</span></div>
                {goal.targetDate && <div style={styles.dateText}>Target date: {new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString('en-IN')}</div>}
                <button style={styles.contributionToggle} onClick={() => setSelectedGoalId(selectedGoalId === goal.id ? null : goal.id)}>{selectedGoalId === goal.id ? 'Hide Contributions' : 'Add / View Contributions'}</button>

                {selectedGoalId === goal.id && (
                  <div style={styles.contributionPanel}>
                    <form onSubmit={(e) => addContribution(e, goal.id)} style={styles.form}>
                      <label style={styles.label}>Contribution Amount</label>
                      <input style={styles.input} type="number" min="0.01" step="0.01" value={contribution.amount} onChange={(e) => setContribution({ ...contribution, amount: e.target.value })} required />
                      <label style={styles.label}>Date</label>
                      <input style={styles.input} type="date" max={today} value={contribution.contributionDate} onChange={(e) => setContribution({ ...contribution, contributionDate: e.target.value })} required />
                      <label style={styles.label}>Note</label>
                      <input style={styles.input} value={contribution.note} onChange={(e) => setContribution({ ...contribution, note: e.target.value })} placeholder="Optional" maxLength={255} />
                      <button style={styles.button} type="submit">Add Contribution</button>
                    </form>
                    <h4 style={styles.historyHeader}>Contribution History</h4>
                    {goal.contributions.length === 0 ? <p style={styles.noDataText}>No contributions yet.</p> : goal.contributions.map((item) => (
                      <div key={item.id} style={styles.contributionRow}>
                        <div><strong>₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong><small>{new Date(`${item.contributionDate}T00:00:00`).toLocaleDateString('en-IN')}{item.note ? ` • ${item.note}` : ''}</small></div>
                        <button style={styles.smallDelete} onClick={() => deleteContribution(item.id)}>Delete</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: '"Rubik", sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#4CAF50' },
  error: { padding: '12px', marginBottom: '20px', backgroundColor: '#FDECEC', color: '#C0392B', borderRadius: '6px' },
  summaryRow: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  summaryCard: { flex: '1', minWidth: '180px', padding: '18px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  topSection: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' },
  leftColumn: { flex: '1', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', maxWidth: '35%' },
  rightColumn: { flex: '2', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  scrollableContainer: { maxHeight: '650px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#ffffff', padding: '10px' },
  sectionHeader: { marginBottom: '15px', color: '#343a40' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: 'bold', marginBottom: '6px', color: '#34495E' },
  input: { marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: 'inherit' },
  buttonflex: { display: 'flex', justifyContent: 'space-between', gap: '10px', marginLeft: '10%' },
  button: { backgroundColor: '#007bff', color: '#ffffff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', width: '140px' },
  resetButton: { backgroundColor: '#dc3545', color: '#ffffff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', width: '140px' },
  goalCard: { padding: '18px', marginBottom: '14px', border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#f8f9fa' },
  goalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
  goalName: { margin: '0 0 7px', color: '#343a40' },
  status: { fontSize: '12px', fontWeight: 'bold', color: '#4CAF50', backgroundColor: '#E8F5E9', padding: '4px 8px', borderRadius: '12px' },
  actions: { display: 'flex', gap: '7px' },
  editButton: { backgroundColor: 'blue', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  deleteButton: { backgroundColor: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  amountRow: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', marginBottom: '8px' },
  progressTrack: { height: '14px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: '10px', transition: 'width 0.3s ease' },
  metaRow: { display: 'flex', justifyContent: 'space-between', marginTop: '7px', fontSize: '13px', color: '#666' },
  dateText: { marginTop: '8px', fontSize: '13px', color: '#666' },
  contributionToggle: { marginTop: '12px', border: 'none', background: 'transparent', color: '#007bff', cursor: 'pointer', padding: '0', fontFamily: 'inherit', fontWeight: 'bold' },
  contributionPanel: { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' },
  historyHeader: { color: '#343a40', marginBottom: '8px' },
  contributionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #eee' },
  contributionRowSmall: {},
  smallDelete: { border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' },
  noDataText: { textAlign: 'center', color: '#6c757d' },
};

export default SavingsGoals;
