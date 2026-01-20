import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import Registration from './pages/LandingPage/Registration.jsx';
import AdminLogin from './pages/Admin/AdminLogin';
import TwoStepRegistration from './pages/Admin/TwoStepRegistration';
import WorkerLogin from './pages/Worker/WorkerLogin';

// Legal pages
import PrivacyPolicy from './pages/LandingPage/PrivacyPolicy.jsx';
import TermsOfService from './pages/LandingPage/TermsOfService.jsx';
import Security from './pages/LandingPage/Security.jsx';

// Protected pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import WorkerDashboard from './pages/Worker/WorkerDashboard';

// Management Pages
import WorkerManagement from './components/admin/WorkerManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import LeaveManagement from './components/admin/LeaveManagement';
import AttendanceManagement from './components/admin/AttendanceManagement';
import NotificationManagement from './components/admin/NotificationManagement';
import SalaryManagement from './components/admin/SalaryManagement';

// Client Management Pages
import ClientLogin from './pages/Client/ClientLogin';
import ClientManagement from './pages/Client/ClientManagement';
import ViewAccount from './pages/Client/ViewAccount';
import EditAccount from './pages/Client/EditAccount';


import QuickTest from './components/common/QuickTest';

// Protected route component
import PrivateRoute from './components/common/PrivateRoute';
import ClientProtectedRoute from './components/common/ClientProtectedRoute';

// Context
import appContext from './context/AppContext';
import { useEffect, useState } from 'react';
import WorkerAttendance from './components/admin/WorkerAttendance';
import Settings from './components/admin/Settings';

// NEW COMPONENTS
import ForgotPassword from './components/admin/ForgotPassword';
import ResetPassword from './components/admin/ResetPassword';
import HolidayManagement from './components/admin/HolidayManagement';

function App() {
  // Initialize subdomain with the actual value from localStorage immediately
const [subdomain, setSubdomain] = useState(() => {
  const stored = localStorage.getItem('tasktracker-subdomain');
  if (stored) return stored;

  // Auto-detect from URL (e.g., companya.ciphergate.in)
  const host = window.location.hostname;
  const parts = host.split('.');
  
  // If the URL has a subdomain and isn't 'www' or 'localhost'
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'ciphergate') {
    return parts[0];
  }
  
  return 'main';
});

  const getSubdomain = () => {
    return localStorage.getItem('tasktracker-subdomain') || 'main';
  };

  // Custom function to update subdomain and localStorage
const updateSubdomain = (newSubdomain) => {
  const valueToStore = (newSubdomain && newSubdomain !== 'main') ? newSubdomain : null;
  
  if (valueToStore) {
    localStorage.setItem('tasktracker-subdomain', valueToStore);
  } else {
    localStorage.removeItem('tasktracker-subdomain');
  }
  
  setSubdomain(valueToStore || 'main');
};

  // Monitor localStorage changes and subdomain updates
  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'tasktracker-subdomain') {
        const newValue = e.newValue || 'main';
        console.log('DEBUG: Storage change detected:', newValue);
        setSubdomain(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for subdomain changes
    const interval = setInterval(() => {
      const current = getSubdomain();
      setSubdomain(prev => {
        if (prev !== current) {
          console.log('DEBUG: Subdomain changed from', prev, 'to', current);
          return current;
        }
        return prev;
      });
    }, 2000); // Check every 2 seconds (reduced frequency)

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Log subdomain changes for debugging
  useEffect(() => {
    console.log('DEBUG: App.jsx subdomain state changed to:', subdomain);
  }, [subdomain]);

  const contextValue = {
    subdomain,
    setSubdomain: updateSubdomain // Use our custom function
  };

  return (
    <appContext.Provider value={contextValue}>
      {/* Updated with consistent theme colors - REMOVED solid bg to show GlobalBackground */}
      <div className="App w-full overflow-x-hidden relative">


        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<TwoStepRegistration />} />
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route path="/quick-test" element={<QuickTest />} />

          {/* Legal pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/security" element={<Security />} />

          {/* NEW PASSWORD ROUTES */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Test Animation Route */}

          {/* Protected Admin routes with Layout */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="workers" element={<WorkerManagement />} />
              <Route path="salary" element={<SalaryManagement />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="attendance/:id" element={<WorkerAttendance />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="leaves" element={<LeaveManagement />} />
              <Route path="holidays" element={<HolidayManagement />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="settings" element={<Settings />} />

              {/* Catch-all route for unknown admin paths */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>

          {/* Protected Worker routes */}
          <Route element={<PrivateRoute allowedRoles={['worker']} />}>
            <Route path="/worker/*" element={<WorkerDashboard />}>              {/* Worker routes are handled inside WorkerDashboard component */}
            </Route>
          </Route>

          {/* Client routes */}
          <Route path="/client/login" element={<ClientLogin />} />

          <Route element={<ClientProtectedRoute />}>
            <Route path="/client/management" element={<ClientManagement />} />
            <Route path="/client/view/:id" element={<ViewAccount />} />
            <Route path="/client/edit/:id" element={<EditAccount />} />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </appContext.Provider>
  );
}


export default App;
