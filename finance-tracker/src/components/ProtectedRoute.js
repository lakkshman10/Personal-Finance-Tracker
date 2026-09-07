import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component }) => {
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    setLoading(false);
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/signin" replace />;
  return <Component />;
};

export default ProtectedRoute;
