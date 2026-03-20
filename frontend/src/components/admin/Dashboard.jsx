import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaArrowRight, FaEllipsisV, FaBuilding, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
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

// Helper component for Circular Progress
const CircularProgress = ({ percentage, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let color = '#ef4444'; // Red for < 50%
  if (percentage >= 100) color = '#10b981'; // Green for 100%
  else if (percentage >= 50) color = '#f59e0b'; // Orange for 50-99%

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(offset) ? circumference : offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-gray-800">{Math.round(percentage || 0)}%</span>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

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
  const { subdomain } = useContext(appContext);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f3f4f6]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Helper component for Stat Cards
  const StatCard = ({ title, value, icon: Icon, colorClass, link }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
          <Icon className={`text-xl ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {link && (
        <Link to={link} className="flex items-center text-xs font-semibold text-gray-400 mt-4 hover:text-[#111111]">
          View details <FaArrowRight className="ml-1 text-[10px]" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="bg-transparent min-h-screen p-2">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Dashboard</h1>
            {/* Mobile Tag: Next to title - Matches layout style */}
            {user?.accountType !== 'premium' && (
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="md:hidden flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm active:scale-95 transition-all mt-1"
              >
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Free Plan</span>
                <span className="text-[8px] bg-teal-500 text-white px-1 py-0.5 rounded font-bold animate-pulse">UPGRADE</span>
              </button>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Overview of your administration</p>
        </div>
        {/* Note: Desktop Upgrade tag is handled by AdminLayout to avoid duplication */}
      </div>

      {/* Stats Grid - Clean Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.workers}
          icon={FaUsers}
          colorClass="bg-gray-900"
          link="/admin/workers"
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area - Departments Section */}
        <div className="lg:col-span-2">
          {/* Overall Attendance Card - New */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Overall Attendance</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-gray-500">Today's overview</p>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter bg-gray-100 text-gray-600">
                  {totalPunchedIn} / {totalEmployees} IN
                </span>
              </div>
            </div>
            <CircularProgress percentage={overallPercentage} size={80} strokeWidth={8} />
          </div>

          {/* Departments Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Departments</h2>
            </div>

            <div className="overflow-x-auto">
              {departments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((department) => {
                    const deptPercentage = department.workerCount > 0
                      ? (department.punchedInCount / department.workerCount) * 100
                      : 0;

                    return (
                      <div
                        key={department._id}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                            onClick={() => handleViewEmployees(department)}
                          >
                            <div className="bg-blue-50 p-3 rounded-xl mr-4">
                              <FaBuilding className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800 hover:text-blue-600 transition-colors">
                                {department.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-500">
                                  {department.workerCount || 0} Employee{(department.workerCount || 0) !== 1 ? 's' : ''}
                                </p>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${department.punchedInCount === department.workerCount && department.workerCount > 0
                                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                                  : 'bg-gray-100 text-gray-600'
                                  }`}>
                                  <>{department.punchedInCount} / {department.workerCount} IN</>
                                </span>
                              </div>
                            </div>
                          </div>
                          <CircularProgress percentage={deptPercentage} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No departments found.
                </div>
              )}
            </div>
          </div>

          {/* Secondary Stats (Leaves) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-gray-500 text-sm font-medium">Pending Leaves</h4>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{stats.leaves.pending}</h2>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <FaCalendarAlt />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-gray-500 text-sm font-medium">Approved Leaves</h4>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{stats.leaves.approved}</h2>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <FaCalendarAlt />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column / Promo Card Style */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#80d8d0] to-[#111111] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg h-full min-h-[300px] flex flex-col justify-between">
            {/* Decoratiive circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Needs Attention!</h2>
              <p className="text-teal-50 text-sm mb-6 opacity-90">
                You have pending items requiring your approval.
              </p>

              <div className="space-y-4">
                {stats.leaves.pending > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium mb-2 text-gray-800">Leave Requests</p>
                    <p className="text-xs text-gray-600 mb-2">{stats.leaves.pending} pending</p>

                    {/* Display pending leave requests */}
                    {pendingLeaves.map((leave) => (
                      <div key={leave._id} className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium truncate text-gray-800">{leave.worker?.name || 'Unknown Employee'}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {stats.leaves.pending > 3 && (
                      <p className="text-xs text-gray-600 mt-1">+{stats.leaves.pending - 3} more</p>
                    )}
                  </div>
                )}

                {stats.leaves.pending === 0 && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center">
                    <span className="text-xl mr-2">🎉</span>
                    <p className="text-sm text-gray-800">All caught up!</p>
                  </div>
                )}
              </div>
            </div>

            <Link
              to="/admin/leaves"
              className="relative z-10 mt-8 w-full bg-white text-[#111111] py-3 rounded-xl font-bold text-center hover:bg-teal-50 transition-colors shadow-md"
            >
              Check Approvals
            </Link>
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

      {/* Employees Modal */}
      <Modal
        isOpen={viewEmployeesModalOpen}
        onClose={() => setViewEmployeesModalOpen(false)}
        title="Department Employees"
      >
        {viewingDepartmentEmployees.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No employees found in this department.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {viewingDepartmentEmployees.map((emp, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-4 bg-gray-50 p-3 rounded p-4 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setViewEmployeesModalOpen(false);
                  fetchEmployeeSummary(emp);
                }}
              >
                <img
                  src={emp.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}`}
                  alt={emp.name}
                  className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
                />
                <div className="flex-1">
                  <span className="text-md font-semibold text-gray-800 block">{emp.name}</span>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border ${emp.status === 'Present' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      emp.status === 'On Leave' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${emp.status === 'Present' ? 'bg-emerald-500' :
                        emp.status === 'On Leave' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}></span>
                      {emp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Employee Performance & Earnings Modal */}
      <Modal
        isOpen={isEmployeeDetailsModalOpen}
        onClose={() => setIsEmployeeDetailsModalOpen(false)}
        title={selectedEmployee ? `${selectedEmployee.name}'s Performance & Earnings` : 'Employee Details'}
        size="lg"
      >
        {isSummaryLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : employeeSummary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg text-white shadow-sm">
                    <FaChartLine />
                  </div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Attendance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-[10px] font-black uppercase">This Month</span>
                    <span className="text-2xl font-black text-indigo-700">{employeeSummary.monthly.performance.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-end opacity-80">
                    <span className="text-gray-500 text-[10px] font-black uppercase">Yearly Avg</span>
                    <span className="text-lg font-bold text-gray-800">{employeeSummary.yearly.performance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-sm">
                    <FaMoneyBillWave />
                  </div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Earnings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-[10px] font-black uppercase">Earned Month</span>
                    <span className="text-2xl font-black text-emerald-700">₹{employeeSummary.monthly.earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end opacity-80">
                    <span className="text-gray-500 text-[10px] font-black uppercase">Yearly Total</span>
                    <span className="text-lg font-bold text-gray-800">₹{employeeSummary.yearly.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500 rounded-lg text-white shadow-sm">
                  <FaCalendarAlt />
                </div>
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">6 Months Trend</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="text-left pb-3">Month</th>
                      <th className="text-center pb-3">Performance</th>
                      <th className="text-right pb-3">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employeeSummary.sixMonths.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-3 text-sm font-bold text-gray-700">{data.month}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${data.performance > 80 ? 'bg-emerald-500' : data.performance > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${data.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 w-10">{data.performance.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm font-black text-emerald-600 tracking-tight">₹{data.earnings.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsEmployeeDetailsModalOpen(false)} className="rounded-xl border-gray-200">
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div >
  );
};

export default Dashboard;