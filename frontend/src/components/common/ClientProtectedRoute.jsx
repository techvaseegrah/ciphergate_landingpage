import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

const ClientProtectedRoute = ({ redirectPath = '/client/login' }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <Spinner />;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = token && user;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Use Outlet to render nested child routes
  return <Outlet />;
};

export default ClientProtectedRoute;