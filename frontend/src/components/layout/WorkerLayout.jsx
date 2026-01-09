import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaHome,
  FaCalendarPlus,
  FaCalendarCheck,
  FaRegCalendarCheck,
  FaRegBell,
  FaBook,
  FaGraduationCap,
  FaTruck
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { getMyLeaves } from '../../services/leaveService';

import Sidebar from './Sidebar';
import appContext from '../../context/AppContext';

const WorkerLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const [leaveUpdates, setLeaveUpdates] = useState(0);
  const navigate = useNavigate();
  const { subdomain } = useContext(appContext);

  // Check for new comments and leave updates
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        if (!subdomain || subdomain == 'main') {
          return;
        }

        // Fetch leaves
        const leaves = await getMyLeaves({ subdomain });
        const unviewedLeaves = leaves.filter(leave =>
          !leave.workerViewed &&
          (leave.status === 'Pending' || leave.status === 'Approved')
        ).length;
        setLeaveUpdates(unviewedLeaves);


      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Fetch immediately on mount
    fetchNotificationCounts();

    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(fetchNotificationCounts, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/worker/login');
  };

  const sidebarLinks = [
    {
      to: '/worker',
      icon: <FaHome />,
      label: 'Dashboard'
    },
    {
      to: '/worker/attendance',
      icon: <FaRegCalendarCheck />,
      label: 'Attendance Report'
    },

    {
      to: '/worker/leave-apply',
      icon: <FaCalendarPlus />,
      label: 'Apply for Leave'
    },
    {
      to: '/worker/leave-requests',
      icon: <FaCalendarCheck />,
      label: 'Leave Requests',
      badge: leaveUpdates > 0 ? leaveUpdates : null
    },
    {
      to: '/worker/notifications',
      icon: <FaRegBell />,
      label: 'Notifications',
    },

  ];

  return (
    // Added w-full overflow-x-hidden to prevent horizontal scrolling
    <div className="flex bg-transparent w-full overflow-x-hidden">
      <Sidebar
        links={sidebarLinks}
        logoText="Employee Dashboard"
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area - adjusted for sidebar */}
      <div className="flex-1 md:ml-64 w-full overflow-x-hidden">
        <main className="p-4 md:p-6 min-h-screen w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkerLayout;