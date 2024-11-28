import React, { useState } from 'react';
import axios from 'axios';
import Signupimage from '../assets/signup.png';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', formData);
      setSuccessMessage(response.data.message);
      setError('');  // Reset error message if the request is successful

      // Set timeout to remove the success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);  // You can change 5000 (milliseconds) to 7000 or 10000

      // Redirect or clear form after success (optional)
      // window.location.href = "/signin"; // If you want to redirect to Sign In page after signup
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong, please try again.');
      setSuccessMessage('');  // Reset success message if an error occurs

      // Set timeout to remove the error message after 5 seconds
      setTimeout(() => setError(''), 5000);  // You can change 5000 (milliseconds) to 7000 or 10000
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Left Column (Form) */}
        <div style={styles.formColumn}>
          <h2 style={styles.title}>Welcome to ExpenseMate! Start Your Journey</h2>
          <p style={styles.subtitle}>Create an account to take control of your finances.</p>
          <form style={styles.form} onSubmit={handleSubmit}>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={styles.nameFields}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                style={styles.input}
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                style={styles.input}
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Sign Up</button>
          </form>
          <p style={styles.existingAccount}>
            Already have an account? <a href="/signin" style={styles.link}>Sign In Here</a>
          </p>
        </div>

        {/* Right Column (Image) */}
        <div style={styles.imageColumn}>
          <img src={Signupimage} alt="Welcome to ExpenseMate" style={styles.image} />
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
    backgroundColor: '#fff',
    padding: '20px',
  },
  formContainer: {
    display: 'flex',
    width: '90%',
    maxWidth: '1100px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  formColumn: {
    width: '50%',
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
    marginTop: '10px',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'left',
    width: '100%',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  nameFields: {
    display: 'flex',
    gap: '15px', // Adds spacing between First Name and Last Name fields
    width: '90%',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1rem',
    width: '87%', // Ensure equal width for all inputs
  },
  button: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    width: '90%',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  imageColumn: {
    width: '40%',
    backgroundColor: '#f7f7f7',
    borderRadius: '0 8px 8px 0',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0 8px 8px 0',
  },
  existingAccount: {
    marginTop: '20px',
    fontSize: '1rem',
    color: '#666',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default SignUp;
