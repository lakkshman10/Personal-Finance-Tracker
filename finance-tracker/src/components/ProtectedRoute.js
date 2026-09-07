import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setToken, setUser } from '../redux/actions';
import api, { setAccessToken } from '../services/api';

const ProtectedRoute = ({ element: Component }) => {
  const [isValid, setIsValid] = useState(false); const [loading, setLoading] = useState(true); const dispatch = useDispatch();
  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      try {
        const refreshResponse = await api.post('/auth/refresh-token'); const token = refreshResponse.data?.accessToken;
        if (!token) throw new Error('No access token returned.');
        setAccessToken(token); dispatch(setToken(token));
        const checkResponse = await api.get('/auth/check'); dispatch(setUser(checkResponse.data.user));
        if (mounted) setIsValid(true);
      } catch {
        setAccessToken(null); dispatch(setToken(null)); dispatch(setUser(null)); localStorage.removeItem('user');
        if (mounted) setIsValid(false);
      } finally { if (mounted) setLoading(false); }
    };
    restoreSession();
    return () => { mounted = false; };
  }, [dispatch]);
  if (loading) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/signin" replace />;
  return <Component />;
};
export default ProtectedRoute;
