import React, { useState, useEffect } from 'react'; 
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ element: Component }) => {
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token'); // Check both Redux and localStorage
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false); // No token, consider invalid
        setLoading(false);
        return;
      }
      
      try {
        await axios.get('http://localhost:5000/api/auth/check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsValid(true); // Token is valid
      } catch {
        setIsValid(false); // Token is invalid
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) return <div>Loading...</div>; // Optional loading state
  if (!isValid) return <Navigate to="/signin" />; // Redirect to sign-in if not authenticated
  return <Component />; // Render protected route component
};

export default ProtectedRoute;
