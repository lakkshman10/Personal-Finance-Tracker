import React from 'react';

function Home() {
  return (
    <section style={styles.container}>
      <h2>Welcome to ExpenseMate</h2>
      <p>Manage your personal finances effortlessly with ExpenseMate.</p>
      <ul>
        <li>Track income and expenses</li>
        <li>Categorize transactions</li>
        <li>Monitor your balance in real-time</li>
        <li>Set and achieve financial goals</li>
      </ul>
    </section>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
};

export default Home;
