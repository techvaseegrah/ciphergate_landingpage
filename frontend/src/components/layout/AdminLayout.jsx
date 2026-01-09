import React, { useState, useEffect, useContext, Suspense } from 'react';
import { useNavigate, Outlet, Routes, Route, Navigate } from 'react-router-dom';
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
import { getAllLeaves } from '../../services/leaveService';

import Sidebar from './Sidebar';
import QuestionGenerationTracker from '../admin/QuestionGenerationTracker';
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
  const [pendingLeaves, setPendingLeaves] = useState(0);


  const [showGlobalTracker] = useState(false);

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

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar
        links={sidebarLinks}
        logoText="Admin Dashboard"
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-auto md:ml-64">
        <main className="p-4 md:p-6">
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
    </div>
  );
};

export default AdminLayout;