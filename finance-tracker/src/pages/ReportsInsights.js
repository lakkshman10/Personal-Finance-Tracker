import React from 'react';

function ReportsInsights() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.icon}>📊</span>
        <h1 style={styles.heading}>Reports & Insights</h1>
        <p style={styles.text}>
          This feature is coming soon. You'll be able to view monthly reports,
          category spending analysis, income vs expenses comparisons, and
          spending trends.
        </p>
        <div style={styles.badge}>Coming Soon</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '40px 20px',
    fontFamily: '"Rubik", sans-serif',
  },
  card: {
    textAlign: 'center',
    padding: '50px 40px',
    maxWidth: '500px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  icon: {
    fontSize: '3.5rem',
    display: 'block',
    marginBottom: '15px',
  },
  heading: {
    fontSize: '2rem',
    color: '#4CAF50',
    marginBottom: '15px',
  },
  text: {
    fontSize: '1.1rem',
    color: '#666',
    lineHeight: '1.7',
    marginBottom: '25px',
  },
  badge: {
    display: 'inline-block',
    padding: '8px 24px',
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
};

export default ReportsInsights;
