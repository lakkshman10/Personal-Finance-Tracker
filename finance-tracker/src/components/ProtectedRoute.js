import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ element: Component }) => {
  const token = useSelector((state) => state.auth?.token);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
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

    if (token) validateToken();
    else setLoading(false); // No token
  }, [token]);

  if (loading) return <div>Loading...</div>; // Optional loading state
  if (!isValid) return <Navigate to="/signin" />;
  return <Component />;
};

export default ProtectedRoute;
