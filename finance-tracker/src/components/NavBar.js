import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/actions';
import api, { clearAccessToken } from '../services/api';
import logo from '../assets/logo.png';
import './NavBar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch(); const navigate = useNavigate(); const token = useSelector((state) => state.auth?.token);
  useEffect(() => { setIsAuthenticated(!!token); }, [token]);
  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (error) { console.error('Logout error:', error); }
    clearAccessToken(); dispatch(logoutUser()); localStorage.removeItem('user'); setIsAuthenticated(false); setIsDropdownOpen(false); navigate('/signin', { replace: true });
  };
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  return (
    <nav style={styles.nav}><div style={styles.logoSection}><img src={logo} alt="Logo" style={styles.logo} /><Link to="/home" style={styles.titleLink}><h1 style={styles.title}>ExpenseMate</h1></Link>
      <div style={styles.navLinks}><NavLink to="/FinanceAssistant" style={styles.link}>Finance Assistant</NavLink><NavLink to="/Financenews" style={styles.link}>Finance News</NavLink><NavLink to="/Community" style={styles.link}>Community</NavLink><NavLink to="/Contactus" style={styles.link}>Contact Us</NavLink>{isAuthenticated && <NavLink to="/dashboard" style={styles.link}>Dashboard</NavLink>}</div>
    </div><div style={styles.authLinks}>{isAuthenticated ? <div style={styles.accountContainer}><div style={styles.accountIcon} onClick={toggleDropdown}><span style={styles.accountText}>A</span></div><div style={{...styles.dropdownMenu,transform:isDropdownOpen?'scale(1)':'scale(0)',visibility:isDropdownOpen?'visible':'hidden'}}><Link to="/account" className="navbar-dropdown-item" style={styles.dropdownItem}>Account</Link><button className="navbar-dropdown-item" style={styles.dropdownItem} onClick={handleLogout}>Logout</button></div></div> : <><Link to="/signin" style={styles.authLink}>Sign In</Link><Link to="/signup" style={styles.authLink}>Sign Up</Link></>}</div></nav>
  );
};
const styles = {
  nav:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 20px',backgroundColor:'#1c2331',color:'#333',boxShadow:'0 2px 4px rgba(0,0,0,0.2)',zIndex:'100',fontFamily:'Rubik'}, logoSection:{display:'flex',alignItems:'center',gap:'10px'}, logo:{width:'40px',height:'40px'}, titleLink:{textDecoration:'none'}, title:{fontSize:'1.8rem',margin:'0',color:'#4CAF50'}, navLinks:{display:'flex',marginLeft:'30px'}, link:{color:'white',textDecoration:'none',fontSize:'1.2rem',padding:'5px 10px',borderRadius:'5px',transition:'background-color 0.3s ease,color 0.3s ease'}, authLinks:{display:'flex',gap:'15px'}, authLink:{color:'#4CAF50',textDecoration:'none',fontSize:'1rem',padding:'5px 10px',borderRadius:'5px',backgroundColor:'#E8F5E9',transition:'background-color 0.3s ease,color 0.3s ease'}, accountContainer:{position:'relative'}, accountIcon:{display:'flex',justifyContent:'center',alignItems:'center',width:'35px',height:'35px',borderRadius:'50%',backgroundColor:'#4CAF50',color:'white',fontSize:'1.2rem',cursor:'pointer',transition:'background-color 0.3s ease'}, accountText:{fontSize:'1.2rem'}, dropdownMenu:{fontFamily:'Rubik',position:'absolute',top:'40px',right:'0',backgroundColor:'#fff',border:'1px solid #ccc',borderRadius:'5px',boxShadow:'0 2px 8px rgba(0,0,0,0.2)',padding:'10px',zIndex:'10',visibility:'hidden',transform:'scale(0)',transition:'transform 0.2s ease,visibility 0.2s ease'},dropdownItem:{display:'block',padding:'10px 15px',fontSize:'1rem',color:'#333',backgroundColor:'transparent',border:'none',textDecoration:'none',cursor:'pointer',transition:'background-color 0.3s ease'}
};
export default Navbar;
