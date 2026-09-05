import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

const ProtectedRoute = ({ element: Component }) => {
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        await api.get('/auth/check');
        setIsValid(true);
      } catch {
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/signin" />;
  return <Component />;
};

export default ProtectedRoute;
