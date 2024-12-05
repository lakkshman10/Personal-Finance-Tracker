import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const token = localStorage.getItem('token'); // Check if token exists

  // If not authenticated, redirect to sign-in page
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the element
  return <Element {...rest} />;
};

export default ProtectedRoute;
