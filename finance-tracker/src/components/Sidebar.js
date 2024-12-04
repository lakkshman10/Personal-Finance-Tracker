import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartBar,
  FaWallet,
  FaPiggyBank,
  FaFileInvoiceDollar,
  FaChartPie,
  FaMoneyBillWave,
  FaTachometerAlt,
  FaBars,
} from 'react-icons/fa';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const features = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Expense Tracker', path: '/expense-tracker', icon: <FaWallet /> },
    { name: 'Budgeting', path: '/budgeting', icon: <FaChartPie /> },
    { name: 'Savings Goals', path: '/savings-goals', icon: <FaPiggyBank /> },
    { name: 'Income Tracking', path: '/income-tracking', icon: <FaFileInvoiceDollar /> },
    { name: 'Reports & Insights', path: '/reports-insights', icon: <FaChartBar /> },
    { name: 'Debt Management', path: '/debt-management', icon: <FaMoneyBillWave /> },
  ];

  const styles = {
    sidebar: {
      width: isCollapsed ? '45px' : '220px',
      height: 'auto',
      backgroundColor: '#1c2331',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      transition: 'width 0.3s ease',
      alignItems: 'flex-start',
    },
    toggleButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      marginBottom: '20px',
      alignSelf: isCollapsed ? 'center' : 'flex-start',
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'white',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '5px',
      transition: 'background-color 0.3s ease',
    },
    linkContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      width: '100%',
    },
    icon: {
      marginRight: isCollapsed ? '0' : '10px',
      fontSize: '1.2rem',
    },
    text: {
      display: isCollapsed ? 'none' : 'block',
      transition: 'opacity 0.3s ease',
    },
  };

  return (
    <div style={styles.sidebar}>
      <button style={styles.toggleButton} onClick={toggleSidebar}>
        <FaBars />
      </button>
      {features.map((feature) => (
        <Link to={feature.path} style={styles.link} key={feature.name}>
          <div style={styles.linkContainer}>
            <span style={styles.icon}>{feature.icon}</span>
            <span style={styles.text}>{feature.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
