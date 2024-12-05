import React, { useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
      width: isCollapsed ? '45px' : '200px',
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
    link: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: isActive ? '#00C49F' : 'white',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '5px',
      transition: 'background-color 0.3s ease',
      backgroundColor: isActive ? '#273142' : 'transparent',
    }),
    linkContainer: {
      display: 'block',
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
      {features.map((feature) => {
        const isActive = location.pathname === feature.path;
        return (
          <Link to={feature.path} style={styles.link(isActive)} key={feature.name}>
            <span style={styles.icon}>{feature.icon}</span>
            <span style={styles.text}>{feature.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default Sidebar;
