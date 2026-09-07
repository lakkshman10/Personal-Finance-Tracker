import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setToken, setUser } from '../redux/actions';
import api, { setAccessToken } from '../services/api';

const ProtectedRoute = ({ element: Component }) => {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    let mounted = true;

    const restoreOrValidateSession = async () => {
      try {
        // After a successful sign-in, the access token is already in memory.
        // Validate it instead of rotating the refresh session again.
        if (token) {
          setAccessToken(token);
          const checkResponse = await api.get('/auth/check');
          dispatch(setUser(checkResponse.data.user));
          if (mounted) setIsValid(true);
          return;
        }

        // On a full page reload the in-memory access token is gone, so use the
        // HttpOnly refresh cookie once to restore the session.
        const refreshResponse = await api.post('/auth/refresh-token');
        const newToken = refreshResponse.data?.accessToken;
        if (!newToken) throw new Error('No access token returned.');

        setAccessToken(newToken);
        dispatch(setToken(newToken));

        const checkResponse = await api.get('/auth/check');
        dispatch(setUser(checkResponse.data.user));
        if (mounted) setIsValid(true);
      } catch {
        setAccessToken(null);
        dispatch(setToken(null));
        dispatch(setUser(null));
        localStorage.removeItem('user');
        if (mounted) setIsValid(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    restoreOrValidateSession();
    return () => { mounted = false; };
  }, [dispatch, token]);

  if (loading) return <div>Loading...</div>;
  if (!isValid) return <Navigate to="/signin" replace />;
  return <Component />;
};

export default ProtectedRoute;
