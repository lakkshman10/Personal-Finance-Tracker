import React from 'react';

function FeatureCard({ icon, title, description }) {
  return (
    <div style={styles.card}>
      {icon && <span style={styles.icon}>{icon}</span>}
      {title && <h3 style={styles.title}>{title}</h3>}
      {description && <p style={styles.description}>{description}</p>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    flex: 1,
    minWidth: '220px',
  },
  icon: {
    fontSize: '3rem',
    color: '#4CAF50',
    marginBottom: '15px',
    display: 'block',
  },
  title: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '10px',
  },
  description: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
  },
};

export default FeatureCard;
