import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaArrowRight, FaEllipsisV, FaBuilding, FaChartLine, FaMoneyBillWave, FaRegBell, FaRegCalendarCheck } from 'react-icons/fa';
import { FiUsers, FiLayers, FiActivity, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiChevronRight, FiBell, FiRefreshCcw } from 'react-icons/fi';
import { getWorkers } from '../../services/workerService';
import { getAllLeaves } from '../../services/leaveService';
import { getDepartments } from '../../services/departmentService';
import { getSalaryReport } from '../../services/salaryService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import PricingModal from '../common/PricingModal';
import { formatCurrency } from '../../utils/formatUtils';
import { motion } from 'framer-motion';

// Precision SaaS Stat Card - Rebuilt for Mobile Performance
const StatCard = ({ title, value, icon: Icon, variant = "white", trend = "+12%", isMobile = false }) => {
  const isNegative = trend.startsWith('-');
  const isDark = variant === "dark";
  
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col justify-between p-4 rounded-[20px] transition-all duration-300 min-h-[110px] cursor-pointer w-full box-border ${
        isDark ? 'bg-slate-900 !shadow-lg shadow-slate-900/10' : 'bg-white shadow-sm !border-0'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex justify-between items-start mb-3">
        <p className={`text-[12px] font-medium leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-400'}`}>
          {title}
        </p>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
          isDark ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'
        }`}>
          <Icon size={18} className="opacity-50" />
        </div>
      </div>

      <div className="flex-1 flex items-center mb-[8px]">
        <motion.div 
          key={value}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-[28px] font-bold tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {value ?? 0}
        </motion.div>
      </div>
      
      <div className="flex items-center mt-2.5">
        <div 
          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold leading-relaxed flex items-center gap-1 ${
            isDark 
              ? (isNegative ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300') 
              : (isNegative ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')
          }`}
        >
          {isNegative ? '↓' : '↑'}{trend.replace(/[+-]/, '')}
        </div>
      </div>
    </motion.div>
  );
};

// Refined Progress Component - SaaS Edition
const PillProgress = ({ label, percentage, color = "bg-emerald-500", icon: Icon }) => (
  <div className="bg-white rounded-[24px] p-[20px] border border-slate-200 flex flex-col gap-5 group transition-all duration-300 hover:border-slate-300 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('500', '50')} ${color.replace('bg-', 'text-')}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-slate-900">{label}</p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Performance Score</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[16px] font-bold text-slate-900">{percentage}%</p>
      </div>
    </div>
    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "circOut" }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    workers: 0,
    leaves: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]); // Changed from topWorkers to departments
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const { subdomain, settings } = useContext(appContext);
  const { user } = useAuth();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [viewEmployeesModalOpen, setViewEmployeesModalOpen] = useState(false);
  const [viewingDepartmentEmployees, setViewingDepartmentEmployees] = useState([]);
  const [isEmployeeDetailsModalOpen, setIsEmployeeDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const fetchEmployeeSummary = async (employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeDetailsModalOpen(true);
    setIsSummaryLoading(true);
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];

      const ranges = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1).toISOString().split('T')[0];
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).toISOString().split('T')[0];
        const monthName = new Date(today.getFullYear(), today.getMonth() - i, 1).toLocaleString('default', { month: 'short' });
        ranges.push({ monthStart, monthEnd, monthName });
      }

      const [monthlyData, yearlyData, ...sixMonthsResults] = await Promise.all([
        getSalaryReport(employee._id, firstDayOfMonth, lastDayOfMonth),
        getSalaryReport(employee._id, firstDayOfYear, lastDayOfYear),
        ...ranges.map(r => getSalaryReport(employee._id, r.monthStart, r.monthEnd))
      ]);

      const sixMonthsData = sixMonthsResults.map((data, idx) => ({
        month: ranges[idx].monthName,
        performance: data.report.summary.attendanceRate,
        earnings: data.finalSalaryWithFines
      }));

      setEmployeeSummary({
        monthly: {
          performance: monthlyData.report.summary.attendanceRate,
          earnings: monthlyData.finalSalaryWithFines
        },
        yearly: {
          performance: yearlyData.report.summary.attendanceRate,
          earnings: yearlyData.finalSalaryWithFines
        },
        sixMonths: sixMonthsData
      });
    } catch (error) {
      console.error('Fetch Employee Summary Error:', error);
      setIsEmployeeDetailsModalOpen(false);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleViewEmployees = (department) => {
    if (!Array.isArray(department.employees)) return;
    setViewingDepartmentEmployees(department.employees);
    setViewEmployeesModalOpen(true);
  };

  // Calculate overall attendance
  const totalPunchedIn = departments.reduce((acc, dept) => acc + (dept.punchedInCount || 0), 0);
  const totalEmployees = departments.reduce((acc, dept) => acc + (dept.workerCount || 0), 0);
  const overallPercentage = totalEmployees > 0 ? (totalPunchedIn / totalEmployees) * 100 : 0;

  const loadDashboardData = async () => {

    setIsLoading(true);
    try {
      const [
        workersDataRaw,
        leavesDataRaw,
        departmentsData // Added departments data
      ] = await Promise.all([
        getWorkers({ subdomain }),
        getAllLeaves({ subdomain }),
        getDepartments({ subdomain }) // Added departments call
      ]);

      const workersData = Array.isArray(workersDataRaw) ? workersDataRaw : [];
      const leavesData = Array.isArray(leavesDataRaw) ? leavesDataRaw : [];
      const departmentsDataSafe = Array.isArray(departmentsData) ? departmentsData : []; // Added departments handling

      const pendingLeaves = leavesData.filter(leave => leave.status === 'Pending');
      const approvedLeaves = leavesData.filter(leave => leave.status === 'Approved');
      const rejectedLeaves = leavesData.filter(leave => leave.status === 'Rejected');

      setStats({
        workers: workersData.length,
        leaves: {
          total: leavesData.length,
          pending: pendingLeaves.length,
          approved: approvedLeaves.length,
          rejected: rejectedLeaves.length,
        },
      });

      // Set pending leaves for display
      setPendingLeaves(pendingLeaves.slice(0, 3));

      // Set departments data
      setDepartments(departmentsDataSafe);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set default values to prevent errors
      setStats({
        workers: 0,
        leaves: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      });
      setPendingLeaves([]);
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [subdomain]);  // Added subdomain to dependency array

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
        <Spinner size="lg" />
      </div>
    );
  }

  

  return (
    <>
      <div className="bg-[#f8fafc] min-h-screen flex flex-col">
        {/* Page Header - Anti-Gravity Spacing */}
        <div className="pt-4 pb-2 px-4 max-w-[1600px] mx-auto font-poppins w-full">
          <div className="page-header-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[18px] sm:text-[24px] font-bold text-slate-900 tracking-tight">Overview</h1>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 shrink-0 leading-relaxed">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>
              <p className="text-slate-400 text-[12px] sm:text-[14px] font-medium leading-snug truncate mb-0">
                Managing <span className="text-slate-900 font-bold">{stats.workers} Professionals</span>
              </p>
            </div>
            <div className="flex items-center justify-start gap-2 w-full sm:w-auto mt-3 sm:mt-0 mb-0">
               <Link 
                to="/admin/workers"
                className="h-[44px] bg-slate-900 text-white rounded-[12px] text-[13px] font-semibold hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center px-4 whitespace-nowrap active:scale-95"
               >
                 Manage Team
               </Link>
               <div className="flex-none">
                 <button 
                  onClick={loadDashboardData}
                  className="w-11 h-11 bg-white text-slate-600 rounded-full hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm active:scale-95 border border-slate-200 p-0"
                  title="Refresh Data"
                 >
                   <FiRefreshCcw size={18} />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="px-4 max-w-[1600px] mx-auto mb-3 w-full relative">
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-[12px] sm:gap-4 pt-2" style={{gridAutoRows: '1fr'}}>
            <StatCard
              title="Total Workforce"
              value={stats.workers}
              icon={FiUsers}
              link="/admin/workers"
              variant="dark"
              trend="+5%"
              isMobile={true}
            />
            <StatCard
              title="Departments"
              value={departments.length}
              icon={FiLayers}
              link="/admin/departments"
              trend="+2%"
              isMobile={true}
            />
            <StatCard
              title="Attendance"
              value={`${Math.round(overallPercentage)}%`}
              icon={FiActivity}
              link="/admin/attendance"
              trend="+12%"
              isMobile={true}
            />
            <StatCard
              title="Pending"
              value={stats.leaves.pending}
              icon={FiCalendar}
              link="/admin/leaves"
              trend="-3%"
              isMobile={true}
            />
          </div>
        </div>        {/* Bento Grid Insights - High-Efficiency Multi-Column Layout */}
        <div className="px-4 max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-4 font-poppins pb-10 flex-1 w-full items-stretch">
           
           {/* Primary Bento Card: Department Health (Spans 2 columns on desktop) */}
           <div className="xl:col-span-2 bg-white rounded-[24px] p-5 shadow-sm !border-0 flex flex-col hover:shadow-md transition-all h-full">
              <div className="flex items-center justify-between mb-8 !border-0">
                 <div>
                    <h2 className="text-[18px] md:text-[20px] font-bold text-slate-900 tracking-tight leading-relaxed">Department Health</h2>
                 </div>
                 <button className="text-[12px] font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all active:scale-95 border-0 leading-relaxed">
                    View All
                 </button>
              </div>
              
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-[14px] flex-1"
              >
                 {departments.map((department) => {
                    const deptPercentage = department.workerCount > 0
                      ? (department.punchedInCount / department.workerCount) * 100
                      : 0;

                    return (
                       <motion.div 
                        key={department._id} 
                        variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 bg-slate-50/50 rounded-[24px] border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => handleViewEmployees(department)}
                       >
                          <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-md group-hover:!bg-slate-900 group-hover:text-white transition-all">
                                   <FiLayers size={16} />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-[14px] font-bold text-slate-900 truncate tracking-tight mb-0.5 leading-relaxed">{department.name}</h4>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 leading-relaxed">{department.workerCount} Professionals</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">{Math.round(deptPercentage)}%</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Cap.</p>
                             </div>
                          </div>
                          
                          {/* Removed progress bar line as requested */}
                       </motion.div>
                    );
                 })}
                 {departments.length === 0 && (
                   <div className="col-span-2 flex items-center justify-center text-slate-300 italic py-20">
                     <p className="text-sm font-medium">No active departments found</p>
                   </div>
                 )}
              </motion.div>
           </div>

           {/* Secondary Bento Stack: Presence & Activity */}
           <div className="flex flex-col gap-5 h-full">
              {/* Presence Bento Card */}
              <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-50 relative overflow-hidden group min-h-[180px] flex flex-col justify-center hover:border-slate-200 transition-all cursor-pointer"
               >
                 <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500 text-slate-900">
                    <FiActivity size={120} />
                 </div>
                 <h2 className="text-[15px] font-extrabold text-slate-400 mb-4 relative z-10 leading-relaxed">Active Presence</h2>
                 <div className="flex items-end gap-2 mb-6 relative z-10">
                    <p className="text-6xl font-bold tracking-tighter text-slate-900">{totalPunchedIn}</p>
                    <p className="text-2xl font-medium text-slate-300 mb-2">/ {totalEmployees}</p>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3 relative z-10">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(totalPunchedIn/totalEmployees)*100}%` }}
                       transition={{ duration: 1.5, ease: "circOut" }}
                       className="h-full bg-slate-900"
                    />
                 </div>
                 <div className="flex justify-between items-center relative z-10">
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{(totalPunchedIn/totalEmployees*100 || 0).toFixed(0)}% Personnel Online</p>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                 </div>
              </motion.div>

              {/* Activity Bento Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-[24px] p-7 shadow-sm border border-slate-50 flex-1 flex flex-col hover:border-slate-200 transition-all cursor-pointer"
              >
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[16px] font-extrabold text-slate-900 tracking-tight">Live Activity</h2>
                    <span className="text-[12px] font-bold text-slate-400 leading-relaxed">Recent Events</span>
                 </div>
                 
                 <div className="space-y-5 flex-1">
                    {pendingLeaves.length > 0 ? (
                       pendingLeaves.map((leave) => (
                          <div key={leave._id} className="flex items-center gap-4 group cursor-pointer">
                             <div className="relative flex-shrink-0">
                                <img 
                                   className="w-11 h-11 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-300" 
                                   src={leave.worker?.photo || `https://ui-avatars.com/api/?name=${leave.worker?.name}&background=f9fafb&color=0f172a&bold=true`} 
                                   alt="" 
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                   <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
                                </div>
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-bold text-slate-900 truncate tracking-tight mb-0.5">{leave.worker?.name}</h4>
                                <p className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-tight">{leave.leaveType} Request</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-200 group-hover:text-slate-900 transition-colors">
                                   {new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="flex flex-col items-center justify-center flex-1 text-slate-300 py-10">
                          <FiBell size={40} className="mb-4 opacity-20" />
                          <p className="text-[13px] font-bold opacity-50">System Idle</p>
                       </div>
                    )}
                 </div>
                 
                 <Link to="/admin/leaves" className="mt-8 pt-6 border-t border-slate-50 text-center text-[12px] font-bold text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                    View Audit Logs <FiChevronRight size={14} />
                 </Link>
               </motion.div>
           </div>
        </div>
      </div>
      <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
        />
        {/* Department Roster Modal */}
        <Modal
          isOpen={viewEmployeesModalOpen}
          onClose={() => setViewEmployeesModalOpen(false)}
          title="Unit Roster"
          size="md"
        >
          <div className="space-y-4">
            {viewingDepartmentEmployees.length === 0 ? (
              <div className="text-center py-16 bg-[#F9FAFB] rounded-[32px] shadow-inner">
                 <FiUsers className="mx-auto text-slate-300 text-3xl mb-4" />
                 <p className="text-[14px] font-normal text-slate-400">No Personnel Assigned</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewingDepartmentEmployees.map((emp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-white p-5 rounded-[24px] shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-300 group"
                    onClick={() => { setViewEmployeesModalOpen(false); fetchEmployeeSummary(emp); }}
                  >
                    <img
                      src={emp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=f9fafb&color=64748b&bold=true`}
                      alt={emp.name}
                      className="w-12 h-12 rounded-2xl shadow-sm group-hover:scale-105 transition-transform object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] font-semibold text-slate-900 block truncate tracking-tight">{emp.name}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${emp.status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className={`text-[12px] font-normal ${emp.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {emp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Employee Summary Details Modal */}
        <Modal
          isOpen={isEmployeeDetailsModalOpen}
          onClose={() => setIsEmployeeDetailsModalOpen(false)}
          title={selectedEmployee ? selectedEmployee.name : 'Personnel Profile'}
          size="lg"
        >
          {isSummaryLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <Spinner size="lg" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">Compiling Metrics...</p>
            </div>
          ) : employeeSummary && (
            <div className="space-y-8 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Performance Analytics Card */}
                <div className="bg-[#F9FAFB] p-8 rounded-[32px] relative overflow-hidden group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="absolute -top-4 -right-4 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110">
                     <FiActivity size={120} />
                  </div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                      <FiActivity size={20} />
                    </div>
                    <div>
                       <h3 className="font-semibold text-slate-900 text-base tracking-tight">Attendance</h3>
                       <p className="font-normal text-slate-500 text-[12px]">Historical Trend</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <p className="text-5xl font-semibold text-slate-900 tracking-tighter">{employeeSummary.monthly.performance.toFixed(1)}%</p>
                      <p className="text-[13px] font-normal text-emerald-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> This Month
                      </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-200/50 flex justify-between items-center">
                      <span className="text-[12px] font-normal text-slate-400">Yearly Benchmark</span>
                      <span className="text-base font-semibold text-slate-900 tracking-tight">{employeeSummary.yearly.performance.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Financial Analytics Card */}
                <div className="bg-slate-900 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/50 transition-all duration-500">
                  <div className="absolute -top-4 -right-4 p-12 opacity-[0.05] group-hover:opacity-[0.12] transition-all group-hover:scale-110 text-white">
                     <FaMoneyBillWave size={120} />
                  </div>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <FaMoneyBillWave size={20} />
                    </div>
                    <div>
                       <h3 className="font-semibold text-white text-base tracking-tight">Earnings</h3>
                       <p className="font-normal text-slate-400 text-[12px]">Compensations</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                      <p className="text-5xl font-semibold text-white tracking-tighter">{formatCurrency(employeeSummary.monthly.earnings, settings)}</p>
                      <p className="text-[13px] font-normal text-emerald-400">Net Payout (Monthly)</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[12px] font-normal text-slate-500">Annual Total</span>
                      <span className="text-base font-semibold text-emerald-400 tracking-tight">{formatCurrency(employeeSummary.yearly.earnings, settings)}</span>
                  </div>
                </div>
              </div>

              {/* 6-Month Trend Visual Table */}
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <FaChartLine size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg tracking-tight">Quarterly Performance</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">6-Month Historical Data</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[12px] font-normal text-slate-400 border-b border-slate-100">
                        <th className="text-left pb-6">Period</th>
                        <th className="text-center pb-6">System Health</th>
                        <th className="text-right pb-6">Final Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {employeeSummary.sixMonths.map((data, index) => (
                        <tr key={index} className="hover:bg-[#F9FAFB] transition-colors group">
                          <td className="py-6 text-sm font-semibold text-slate-900">{data.month}</td>
                          <td className="py-6">
                            <div className="flex items-center justify-center gap-6">
                              <div className="w-32 h-[6px] bg-[#F9FAFB] rounded-[10px] overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ease-out ${data.performance > 80 ? 'bg-emerald-500' : data.performance > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${data.performance}%` }}
                                ></div>
                              </div>
                              <span className="text-[12px] font-semibold text-slate-900 w-12">{data.performance.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-6 text-right text-sm font-semibold text-slate-900">{formatCurrency(data.earnings, settings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsEmployeeDetailsModalOpen(false)} className="rounded-[30px] px-10 py-4 font-semibold text-[14px] border-none bg-[#F9FAFB] hover:bg-slate-900 hover:text-white transition-all duration-300">
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </Modal>
    </>
  );
};

export default Dashboard;