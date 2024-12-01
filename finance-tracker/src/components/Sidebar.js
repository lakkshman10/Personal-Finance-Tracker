import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>FinanceTracker</h2>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Dashboard</Link>
        <Link to="/expense-tracker" style={styles.navLink}>Expense Tracker</Link>
        <Link to="/budgeting" style={styles.navLink}>Budgeting</Link>
        <Link to="/savings-goals" style={styles.navLink}>Savings Goals</Link>
        <Link to="/income-tracking" style={styles.navLink}>Income Tracking</Link>
        <Link to="/reports-insights" style={styles.navLink}>Reports & Insights</Link>
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    marginBottom: "20px",
    fontSize: "1.5rem",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  navLink: {
    textDecoration: "none",
    color: "#fff",
    fontSize: "1.2rem",
    padding: "10px",
    borderRadius: "5px",
    transition: "background 0.3s",
  },
};

export default Sidebar;
