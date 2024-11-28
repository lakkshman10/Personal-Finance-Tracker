import React, { useState } from 'react';
import axios from 'axios';
import SignInImage from '../assets/Signin-image.png';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Handles API or validation errors
  const [success, setSuccess] = useState(''); // Handles success messages

  const validateForm = async (e) => {
    e.preventDefault();
    setError(''); // Reset error
    setSuccess(''); // Reset success

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', { email, password });
      console.log(response.data); // Log the response
      alert(response.data.message); // Success message
      localStorage.setItem('token', response.data.token); // Store token
      window.location.href = '/dashboard'; // Redirect
    } catch (error) {
      alert(error.response?.data?.message || 'Signin failed, please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.formColumn}>
          <h2 style={styles.title}>Welcome Back to ExpenseMate!</h2>
          <p style={styles.subtitle}>Sign in to continue managing your finances.</p>
          <form style={styles.form} onSubmit={validateForm}>
            {success && <p style={{ ...styles.alert, ...styles.success }}>{success}</p>}
            {error && <p style={{ ...styles.alert, ...styles.error }}>{error}</p>}
            <input
              type="email"
              placeholder="Email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" style={styles.button}>
              Sign In
            </button>
          </form>
          <p style={styles.existingAccount}>
            Don't have an account?{' '}
            <a href="/signup" style={styles.link}>
              Sign Up Here
            </a>
          </p>
        </div>
        <div style={styles.imageColumn}>
          <img src={SignInImage} alt="Sign In Illustration" style={styles.image} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    padding: '20px',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    maxWidth: '1000px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  formColumn: {
    flex: '1 1 400px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
    width: '100%',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem',
    width: '100%',
  },
  button: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  existingAccount: {
    marginTop: '20px',
    color: '#666',
    fontSize: '1rem',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  imageColumn: {
    flex: '1 1 400px',
    backgroundColor: '#f7f7f7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  alert: {
    fontSize: '1rem',
    margin: '10px 0',
    padding: '10px',
    borderRadius: '5px',
    width: '100%',
    textAlign: 'center',
  },
  success: {
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
  },
  error: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
  },
};

export default SignIn;
