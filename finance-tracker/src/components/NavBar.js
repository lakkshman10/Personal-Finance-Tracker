import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.png'; // Ensure this path is correct

function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown menu state

  useEffect(() => {
    const token = localStorage.getItem('token'); // Check for token
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear stored user data
    setIsAuthenticated(false);
    setIsDropdownOpen(false); // Close the dropdown
    window.location.href = '/signin'; // Redirect to sign-in
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown state
  };

  return (
    <nav style={styles.nav}>
      {/* Logo and Title Section */}
      <div style={styles.logoSection}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <Link to="/home" style={styles.titleLink}>
          <h1 style={styles.title}>ExpenseMate</h1>
        </Link>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <NavLink to="/FinanceAssistant" style={styles.link}>
            Finance Assistant
          </NavLink>
          <NavLink to="/Financenews" style={styles.link}>
            Finance News
          </NavLink>
          <NavLink to="/Community" style={styles.link}>
            Community
          </NavLink>
          <NavLink to="/Contactus" style={styles.link}>
            Contact Us
          </NavLink>
        </div>
      </div>

      {/* Authentication Links */}
      <div style={styles.authLinks}>
        {isAuthenticated ? (
          <div style={styles.accountContainer}>
            <div style={styles.accountIcon} onClick={toggleDropdown}>
              <span style={styles.accountText}>A</span>
            </div>
            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <Link to="/account" style={styles.dropdownItem}>
                  Account
                </Link>
                <button style={styles.dropdownItem} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/signin" style={styles.authLink}>Sign In</Link>
            <Link to="/signup" style={styles.authLink}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#1c2331',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: '100',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    width: '40px',
    height: '40px',
  },
  titleLink: {
    textDecoration: 'none',
  },
  title: {
    fontSize: '1.8rem',
    fontFamily: 'Rubik',
    margin: '0',
    color: '#4CAF50',
  },
  navLinks: {
    display: 'flex',
    marginLeft: '30px',
  },
  link: {
    color: 'White',
    textDecoration: 'none',
    fontSize: '1.2rem',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  authLinks: {
    display: 'flex',
    gap: '15px',
  },
  authLink: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '5px 10px',
    borderRadius: '5px',
    backgroundColor: '#E8F5E9',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  accountContainer: {
    position: 'relative',
  },
  accountIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  accountText: {
    fontSize: '1.2rem',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '40px',
    right: '0',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    padding: '10px',
    zIndex: '10',
  },
  dropdownItem: {
    fontFamily:'Rubik',
    display: 'block',
    width: '100%', // Make it fit dropdown width
    textAlign: 'left',
    padding: '10px 15px',
    fontSize: '1rem',
    color: '#333', // Neutral text color
    backgroundColor: 'transparent', // Transparent background for uniformity
    border: 'none', // Remove button border
    textDecoration: 'none', // Remove link underline
    cursor: 'pointer', // Pointer for button consistency
    transition: 'background-color 0.3s ease',
    outline: 'none', // Remove focus outline
    ':hover': {
      backgroundColor: '#f0f0f0', // Subtle background on hover
      color: '#000',
    },
  },
};

export default NavBar;
