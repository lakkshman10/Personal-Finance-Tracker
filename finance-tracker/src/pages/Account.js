import React, { useEffect, useState } from 'react';
import financeApi from '../services/financeApi';

const Account = () => {
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', currency: 'INR', timezone: 'Asia/Kolkata' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await financeApi.userAccount.get();
      const user = response.data.user;
      setAccount(response.data);
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        currency: user.currency || 'INR',
        timezone: user.timezone || 'Asia/Kolkata',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccount(); }, []);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handlePasswordChange = (event) => setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value });

  const saveAccount = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage(''); setError('');
      const response = await financeApi.userAccount.update(form);
      setAccount((current) => ({ ...current, user: response.data.user }));
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage(response.data.message || 'Account updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update your account.');
    } finally { setSaving(false); }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    try {
      setChangingPassword(true); setMessage(''); setError('');
      const response = await financeApi.userAccount.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage(response.data.message || 'Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change your password.');
    } finally { setChangingPassword(false); }
  };

  if (loading) return <div style={styles.container}><h1 style={styles.header}>Account</h1><div style={styles.card}><p style={styles.muted}>Loading your account...</p></div></div>;

  if (error && !account) return <div style={styles.container}><h1 style={styles.header}>Account</h1><div style={styles.card}><p style={styles.error}>{error}</p><button onClick={loadAccount} style={styles.button}>Try Again</button></div></div>;

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div><h1 style={styles.header}>Account</h1><p style={styles.subtitle}>Manage your ExpenseMate profile and account security.</p></div>
      </div>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Profile Information</h2>
          <form onSubmit={saveAccount} style={styles.form}>
            <div style={styles.twoColumns}>
              <label style={styles.label}>First Name<input name="firstName" value={form.firstName} onChange={handleChange} style={styles.input} /></label>
              <label style={styles.label}>Last Name<input name="lastName" value={form.lastName} onChange={handleChange} style={styles.input} /></label>
            </div>
            <label style={styles.label}>Email<input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} /></label>
            <div style={styles.twoColumns}>
              <label style={styles.label}>Currency<input name="currency" maxLength="3" value={form.currency} onChange={handleChange} style={styles.input} /></label>
              <label style={styles.label}>Timezone<input name="timezone" value={form.timezone} onChange={handleChange} style={styles.input} /></label>
            </div>
            <button type="submit" disabled={saving} style={styles.button}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Security</h2>
          <form onSubmit={savePassword} style={styles.form}>
            <label style={styles.label}>Current Password<input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} style={styles.input} autoComplete="current-password" /></label>
            <label style={styles.label}>New Password<input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} style={styles.input} autoComplete="new-password" /></label>
            <p style={styles.hint}>Use at least 8 characters with a letter, number, and special character.</p>
            <button type="submit" disabled={changingPassword} style={styles.button}>{changingPassword ? 'Changing...' : 'Change Password'}</button>
          </form>
        </section>
      </div>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Account Details</h2>
        <div style={styles.details}><div><span style={styles.detailLabel}>Email</span><strong>{account?.user?.email}</strong></div><div><span style={styles.detailLabel}>Member since</span><strong>{account?.createdAt ? new Date(account.createdAt).toLocaleDateString('en-IN') : '—'}</strong></div><div><span style={styles.detailLabel}>User ID</span><strong style={styles.id}>{account?.user?.id}</strong></div></div>
      </section>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Rubik, sans-serif', maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },
  titleRow: { marginBottom: '22px' }, header: { margin: 0, color: '#4CAF50' }, subtitle: { margin: '7px 0 0', color: '#6c757d' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }, card: { background: '#f8f9fa', borderRadius: '8px', padding: '24px', marginBottom: '20px' }, sectionTitle: { margin: '0 0 18px', color: '#343a40', fontSize: '20px' }, form: { display: 'flex', flexDirection: 'column', gap: '16px' }, twoColumns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }, label: { display: 'flex', flexDirection: 'column', gap: '7px', color: '#495057', fontSize: '14px', fontWeight: '500' }, input: { padding: '11px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '15px', fontFamily: 'Rubik, sans-serif', boxSizing: 'border-box' }, button: { alignSelf: 'flex-start', padding: '11px 18px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Rubik, sans-serif', fontWeight: '500' }, hint: { margin: '-5px 0 0', color: '#6c757d', fontSize: '12px' }, success: { background: '#E8F5E9', color: '#2E7D32', borderRadius: '6px', padding: '12px 15px', marginBottom: '18px' }, errorBox: { background: '#FDECEC', color: '#C62828', borderRadius: '6px', padding: '12px 15px', marginBottom: '18px' }, error: { color: '#C62828' }, muted: { color: '#6c757d' }, details: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }, detailLabel: { display: 'block', color: '#6c757d', fontSize: '13px', marginBottom: '6px' }, id: { fontSize: '11px', wordBreak: 'break-all', fontWeight: '400', color: '#495057' },
};

export default Account;
