import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.png'; // Make sure to use an actual logo

function NavBar() {
  return (
    <nav style={styles.nav}>
      {/* Logo and Title Section */}
      <div style={styles.logoSection}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>ExpenseMate</h1>
        
        {/* Navigation Links with a 30px gap */}
        <div style={styles.navLinks}>
          <NavLink to="/about" style={styles.link} activeClassName="activeLink">
            About
          </NavLink>
          <NavLink to="/features" style={styles.link} activeClassName="activeLink">
            Features
          </NavLink>
          <NavLink to="/contact" style={styles.link} activeClassName="activeLink">
            Contact
          </NavLink>
        </div>
      </div>

      {/* Authentication Links */}
      <div style={styles.authLinks}>
        <Link to="/signin" style={styles.authLink}>Sign In</Link>
        <Link to="/signup" style={styles.authLink}>Sign Up</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',  // Flexbox to organize horizontally
    justifyContent: 'space-between',  // Spread out logo, navLinks, and authLinks
    alignItems: 'center',  // Align items vertically centered
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: '100',  // Ensure navigation stays visible even when scrolling
  },
  logoSection: {
    display: 'flex',  // Logo, title, and nav links are aligned horizontally
    alignItems: 'center',
    gap:'10px'
  },
  logo: {
    width: '40px',  // Adjust logo size
    height: '40px',
  },
  title: {
    fontSize: '1.8rem',
    fontfamily: 'Rubik',
    margin: '0',  // Remove any default margin
    color: '#4CAF50',
  },
  navLinks: {
    display: 'flex',  // Flexbox for nav links
    marginLeft: '30px',  // Adding a 30px gap between title and nav links
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontSize: '1.2rem',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  authLinks: {
    display: 'flex',  // Align Sign In/Sign Up to the right
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
};

export default NavBar;
