import React, { useState, useEffect, useContext, Suspense } from 'react';
import { useNavigate, Outlet, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiSettings,
  FiBell,
  FiLayers,
  FiMenu,
  FiPieChart,
  FiUser,
  FiCreditCard
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdSettings } from 'react-icons/io';

import { useAuth } from '../../hooks/useAuth';
import { usePayment } from '../../hooks/usePayment';
import { getAllLeaves } from '../../services/leaveService';

import Sidebar from './Sidebar';
import QuestionGenerationTracker from '../admin/QuestionGenerationTracker';
import PricingModal from '../common/PricingModal';
import PausedScreen from '../common/PausedScreen';
import ShatteredLogo from '../common/ShatteredLogo';
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
import WorkAllocation from '../admin/WorkAllocation';
import ManageTaskTopicsPage from '../admin/ManageTaskTopicsPage';



const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { handleCancelAutoRenew, isCancelling } = usePayment();
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [showGlobalTracker] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { subdomain } = useContext(appContext);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchNotificationCounts = async () => {
      try {
        const leaves = await getAllLeaves({ subdomain });
        if (!isMounted) return;

        const leavesData = Array.isArray(leaves) ? leaves : [];
        const unviewedLeaves = leavesData.filter(leave =>
          !leave.workerViewed &&
          (leave.status === 'Pending' || leave.status === 'Approved')
        ).length;
        
        setPendingLeaves(unviewedLeaves);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };

    fetchNotificationCounts();
    intervalId = setInterval(fetchNotificationCounts, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [subdomain]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // NOTE: Removed hardcoded iconColors to allow Sidebar CSS to control active/inactive state colors
  // Icons now inherit text color from parent (White for inactive, Teal for active)

  const sidebarLinks = [
    {
      to: '/admin',
      icon: <FiHome />,
      label: 'Dashboard'
    },
    {
      to: '/admin/workers',
      icon: <FiUsers />,
      label: 'Employees'
    },
    {
      to: '/admin/salary',
      icon: <FiDollarSign />,
      label: 'Salary'
    },
    {
      to: '/admin/attendance',
      icon: <FiCalendar />,
      label: 'Attendance'
    },
    {
      to: '/admin/departments',
      icon: <FiLayers />,
      label: 'Departments'
    },
    {
      icon: <FiLayers />,
      label: 'Work Allocation',
      isDropdown: true,
      children: [
        { to: '/admin/work-allocation', label: 'Task Board' },
        { to: '/admin/work-allocation/topics', label: 'Manage Topics' }
      ]
    },
    {
      to: '/admin/leaves',
      icon: <FiCalendar />,
      label: 'Leave Requests',
      badge: pendingLeaves > 0 ? pendingLeaves : null
    },
    {
      to: '/admin/holidays',
      icon: <FiCalendar />,
      label: 'Holidays'
    },
    {
      to: '/admin/notifications',
      icon: <FiBell />,
      label: 'Notifications',
    },
    {
      to: '/admin/settings',
      icon: <FiSettings />,
      label: 'Settings',
    }
  ];

  const bottomNavLinks = [
    { to: '/admin', icon: <FiHome />, label: 'Home' },
    { to: '/admin/workers', icon: <FiUsers />, label: 'Employees' },
    { to: '/admin/salary', icon: <FiDollarSign />, label: 'Salary' },
    { to: '/admin/attendance', icon: <FiCalendar />, label: 'Attendance' },
    { to: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  // ── Paused screen — shown when subscription is paused ──
  if (user?.accountStatus === 'paused') {
    return <PausedScreen user={user} />;
  }

  return (
    <div className="admin-app-shell flex h-screen overflow-x-hidden bg-[#F9FAFB]" style={{ boxSizing: 'border-box' }}>
      <Sidebar
        links={sidebarLinks}
        logoText="Admin Dashboard"
        user={user}
        onLogout={handleLogout}
        onUpgradeClick={() => setShowPricingModal(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onExpandToggle={(expanded) => setIsSidebarExpanded(expanded)}
      />

      <div className={`flex-1 flex flex-col min-h-screen relative admin-main-content transition-all duration-300 ${isSidebarExpanded ? 'md:ml-64' : 'md:ml-[84px]'} overflow-x-hidden`} style={{ boxSizing: 'border-box' }}>
        <header 
          className="admin-header lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm"
          style={{ height: '64px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-3">
              <button 
                 type="button"
                 className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                 style={{ width: '44px', height: '44px' }}
                 onClick={() => setIsSidebarOpen(true)}
                 aria-label="Menu"
              >
                 <FiMenu size={24} style={{ color: '#0f172a' }} />
              </button>
          </div>

          <div className="relative">
              <button 
                 onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                 className="flex-shrink-0 overflow-hidden bg-white border-2 border-slate-200 p-0 cursor-pointer active:scale-90 transition-all shadow-sm"
                 style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                 <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img
                       className="h-full w-full object-cover"
                       src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || 'AD')}&background=0f172a&color=ffffff&bold=true&font-size=0.45`}
                       alt="Profile"
                    />
                 </div>
              </button>

             <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="fixed inset-0 bg-black/20 z-[110]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-[120] overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50">
                        <p className="font-bold text-slate-900 text-sm mb-0.5">{user?.name || 'Admin User'}</p>
                        <p className="text-slate-500 text-xs capitalize">{user?.role || 'Administrator'}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer text-sm font-medium"
                        >
                          <FiHome size={18} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
             </AnimatePresence>
          </div>
        </header>

        {/* Desktop Header Overlay */}
        <div className="sticky top-0 z-10 hidden lg:flex justify-end px-8 py-4 bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            {user?.accountType === 'premium' ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200 shadow-sm cursor-pointer hover:border-amber-300 transition-all"
                >
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-bold text-amber-900 font-poppins">Premium Plan</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group cursor-pointer"
              >
                <span className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-emerald-400 transition-colors"></span>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 transition-colors font-poppins">Free Plan</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full ml-1 font-bold font-poppins">UPGRADE</span>
              </button>
            )}
          </div>
        </div>

        <main className="flex-1 pb-[100px] lg:pb-8 px-4 max-w-[1600px] mx-auto w-full overflow-y-auto">
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
            <Route path="work-allocation" element={<WorkAllocation />} />
            <Route path="work-allocation/topics" element={<ManageTaskTopicsPage />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>

        {/* Refined Pill-Style Mobile Bottom Nav */}
        <div className="lg:hidden fixed left-1/2 -translate-x-1/2 z-[200] bottom-4">
          <nav className="flex items-center justify-between w-full h-full px-1">
            {bottomNavLinks.map((link) => {
               const isActive = location.pathname === link.to;
               
               return (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    className={`flex items-center justify-center transition-all duration-300 no-underline px-3 py-2 rounded-full ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center justify-center">
                      {React.cloneElement(link.icon, { size: 20 })}
                    </span>
                    {isActive && (
                      <span className="text-[12px] font-bold ml-2 font-poppins whitespace-nowrap">
                        {link.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
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