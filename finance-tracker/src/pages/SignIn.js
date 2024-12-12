import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken, setUser } from '../redux/actions';
import SignInImage from '../assets/Signin-image.png';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/signin',
        { email, password },
        { withCredentials: true }
      );

      const { accessToken, user } = response.data;

      // Dispatch token and user to Redux
      dispatch(setToken(accessToken));
      dispatch(setUser(user));

      // Sync with localStorage (optional)
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signin failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.formColumn}>
          <h2 style={styles.title}>Welcome Back to ExpenseMate!</h2>
          <p style={styles.subtitle}>Sign in to continue managing your finances.</p>
          <form style={styles.form} onSubmit={validateForm}>
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
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
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
    width: '90%',
    maxWidth: '1000px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  formColumn: {
    width: '45%',
    padding: '35px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'left',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'left',
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
    padding: '10px',
    backgroundColor: '#4CAF50',
    width: '90%',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginLeft: '30px',
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
    width: '60%',
    backgroundColor: '#f7f7f7',
    borderRadius: '0 8px 8px 0',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0 8px 8px 0',
  },
  alert: {
    fontSize: '1rem',
    margin: '10px 0',
    padding: '10px',
    borderRadius: '5px',
    width: '100%',
    textAlign: 'center',
  },
  error: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
  },
};

export default SignIn;
