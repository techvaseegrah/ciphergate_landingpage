import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from './Spinner';

const PrivateRoute = ({
  allowedRoles = [],
  redirectPath = '/login'
}) => {
  const [status, setStatus] = useState('checking'); // 'checking', 'allowed', 'redirect-client', 'redirect-login'
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Show loading spinner while checking authentication
    if (loading) {
      setStatus('loading');
      return;
    }

    // More robust authentication check
    const isAuthorized =
      token &&
      user &&
      (allowedRoles.length === 0 || allowedRoles.includes(user.role));

    if (isAuthorized) {
      setStatus('allowed');
    } else {
      // Intelligent redirect path
      const currentPath = window.location.pathname;

      if (allowedRoles.includes('admin')) {
        setTimeout(() => navigate('/admin/login', { replace: true }), 0);
      } else if (allowedRoles.includes('worker')) {
        // For worker routes, check if we're already on a worker login page
        // to avoid redirect loops
        if (currentPath.startsWith('/worker/login')) {
          setTimeout(() => navigate('/worker/login', { replace: true }), 0);
        } else {
          setTimeout(() => navigate('/worker/login', { replace: true }), 0);
        }
      } else {
        setTimeout(() => navigate(redirectPath, { replace: true }), 0);
      }
      return;
    }
  }, [user, loading, allowedRoles.join(','), navigate]); // Using allowedRoles as string to avoid dependency issues

  // Show loading spinner
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Render outlet only if allowed
  if (status === 'allowed') {
    return <Outlet />;
  }

  // Return null while checking or redirecting
  return null;
};

export default PrivateRoute;