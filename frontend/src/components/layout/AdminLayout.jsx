import React, { useState, useEffect, useContext, Suspense } from 'react';
import { useNavigate, Outlet, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaRegCalendarCheck,
  FaRegBell,
  FaDollarSign,
  FaAsterisk,
  FaTruck
} from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';

import { useAuth } from '../../hooks/useAuth';
import { usePayment } from '../../hooks/usePayment';
import { getAllLeaves } from '../../services/leaveService';

import Sidebar from './Sidebar';
import QuestionGenerationTracker from '../admin/QuestionGenerationTracker';
import PricingModal from '../common/PricingModal';
import PausedScreen from '../common/PausedScreen';
import appContext from '../../context/AppContext';

// Import management components
import WorkerManagement from '../admin/WorkerManagement';
import DepartmentManagement from '../admin/DepartmentManagement';
import LeaveManagement from '../admin/LeaveManagement';
import AttendanceManagement from '../admin/AttendanceManagement';
import NotificationManagement from '../admin/NotificationManagement';
import SalaryManagement from '../admin/SalaryManagement';
import HolidayManagement from '../admin/HolidayManagement';
import Settings from '../admin/Settings';
import WorkerAttendance from '../admin/WorkerAttendance';
import AdminDashboard from '../../pages/Admin/AdminDashboard';


const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { handleCancelAutoRenew, isCancelling } = usePayment();
  const [pendingLeaves, setPendingLeaves] = useState(0);


  const [showGlobalTracker] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const navigate = useNavigate();
  const { subdomain } = useContext(appContext);

  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        // Ensure subdomain is passed as an object to match expected API format
        const leaves = await getAllLeaves({ subdomain }) || [];
        const unviewedLeaves = Array.isArray(leaves) ? leaves.filter(leave =>
          !leave.workerViewed &&
          (leave.status === 'Pending' || leave.status === 'Approved')
        ).length : 0;
        setPendingLeaves(unviewedLeaves);


      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotificationCounts();

    const intervalId = setInterval(fetchNotificationCounts, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [subdomain]);  // Added subdomain to dependency array

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // NOTE: Removed hardcoded iconColors to allow Sidebar CSS to control active/inactive state colors
  // Icons now inherit text color from parent (White for inactive, Teal for active)

  const sidebarLinks = [
    {
      to: '/admin',
      icon: <FaHome />,
      label: 'Dashboard'
    },
    {
      to: '/admin/workers',
      icon: <FaUsers />,
      label: 'Employees'
    },
    {
      to: '/admin/salary',
      icon: <FaDollarSign />,
      label: 'Salary'
    },

    {
      to: '/admin/attendance',
      icon: <FaRegCalendarCheck />,
      label: 'Attendance'
    },
    {
      to: '/admin/departments',
      icon: <FaBuilding />,
      label: 'Departments'
    },


    {
      to: '/admin/leaves',
      icon: <FaCalendarAlt />,
      label: 'Leave Requests',
      badge: pendingLeaves > 0 ? pendingLeaves : null
    },

    {
      to: '/admin/holidays',
      icon: <FaAsterisk />,
      label: 'Holidays'
    },
    {
      to: '/admin/notifications',
      icon: <FaRegBell />,
      label: 'Notifications',
    },


    {
      to: '/admin/settings',
      icon: <IoMdSettings />,
      label: 'Settings',
    }
  ];

  // ── Paused screen — shown when subscription is paused ──
  if (user?.accountStatus === 'paused') {
    return <PausedScreen user={user} />;
  }

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar
        links={sidebarLinks}
        logoText="Admin Dashboard"
        user={user}
        onLogout={handleLogout}
        onUpgradeClick={() => setShowPricingModal(true)}
      />

      <div className="flex-1 overflow-auto md:ml-64 relative">
        {/* Top Right Status Badge */}
        <div className="fixed top-4 right-6 z-10 hidden md:block">
          {user?.accountType === 'premium' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">Premium Plan</span>
              </div>
              {user?.autoRenew && (
                <button
                  onClick={handleCancelAutoRenew}
                  disabled={isCancelling}
                  className="text-[9px] text-gray-400 hover:text-red-500 uppercase tracking-wider transition-colors px-2 py-1 border border-transparent hover:border-red-200 rounded"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Auto-Renew'}
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:border-teal-300 transition-all group cursor-pointer"
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-teal-600 transition-colors">Free Plan</span>
              <span className="text-[9px] bg-teal-500 text-white px-1.5 py-0.5 rounded ml-1 animate-bounce">UPGRADE</span>
            </button>
          )}
        </div>

        <main className="p-4 md:p-6 pt-16 md:pt-16">
          <Routes>
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

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>

      <QuestionGenerationTracker
        isVisible={showGlobalTracker}
        onClose={() => { }}
        generationData={null}
        isGenerating={false}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
};

export default AdminLayout;