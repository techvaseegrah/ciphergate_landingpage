import React, { useState, useEffect, useContext, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaUserFriends, FaUserAlt, FaChartLine, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { getDepartments, createDepartment, deleteDepartment, updateDepartment } from '../../services/departmentService';
import { getSalaryReport } from '../../services/salaryService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';

const DepartmentManagement = () => {
  const departmentInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
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

      // Prepare 6 months ranges
      const ranges = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1).toISOString().split('T')[0];
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0).toISOString().split('T')[0];
        const monthName = new Date(today.getFullYear(), today.getMonth() - i, 1).toLocaleString('default', { month: 'short' });
        ranges.push({ monthStart, monthEnd, monthName });
      }

      // Fetch all data in parallel
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
      toast.error('Failed to fetch employee performance details');
      setIsEmployeeDetailsModalOpen(false);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleViewEmployees = (department) => {
    if (!Array.isArray(department.employees)) {
      toast.warn("No employee data available for this department.");
      return;
    }

    setViewingDepartmentEmployees(department.employees); // expected: array of { name, photo }
    setViewEmployeesModalOpen(true);
  };

  const { subdomain } = useContext(appContext);

  useEffect(() => {
    if (isAddModalOpen && departmentInputRef.current) {
      setTimeout(() => departmentInputRef.current.focus(), 100);
    }
  }, [isAddModalOpen]);

  const loadDepartments = async () => {
    setIsLoading(true);
    if (!subdomain || subdomain == 'main') {
      return;
    }

    try {
      const departmentsData = await getDepartments({ subdomain });
      console.log('Departments Loaded:', departmentsData);

      // Ensure departmentsData is an array and has unique identifiers
      const safeDepartments = Array.isArray(departmentsData)
        ? departmentsData.map(dept => ({
          ...dept,
          // Ensure a unique key if not already present
          key: dept._id || Math.random().toString(36).substr(2, 9)
        }))
        : [];

      setDepartments(safeDepartments);
    } catch (error) {
      console.error('Department Load Error:', error);
      toast.error('Failed to load departments');
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    // Trim and validate department name
    const trimmedName = departmentName.trim();
    if (!trimmedName) {
      toast.error('Department name cannot be empty');
      return;
    }

    if (!subdomain || subdomain == 'main') {
      console.log(subdomain);
      toast.error('Subdomain is missing, check the URL.');
      return;
    }

    try {
      // Create department
      const newDepartment = await createDepartment({ name: trimmedName, subdomain });

      // Add a unique key to the new department
      const departmentWithKey = {
        ...newDepartment,
        key: newDepartment._id || Math.random().toString(36).substr(2, 9)
      };

      // Update local state
      setDepartments(prev => {
        // Ensure prev is an array before spreading
        const currentDepartments = Array.isArray(prev) ? prev : [];
        return [...currentDepartments, departmentWithKey];
      });

      // Reset form and close modal
      setDepartmentName('');
      setIsAddModalOpen(false);

      toast.success('Department added successfully');
    } catch (error) {
      console.error('Add Department Error:', error);
      toast.error(error.message || 'Failed to add department');
    }
  };


  const handleEditDepartment = async (e) => {
    e.preventDefault();

    if (!editingDepartment) return;

    const trimmedName = editingDepartment.name.trim();
    if (!trimmedName) {
      toast.error('Department name cannot be empty');
      return;
    }

    try {
      // Update department
      const updatedDepartment = await updateDepartment(editingDepartment._id, {
        name: trimmedName
      });

      // Update local state
      setDepartments(prev =>
        prev.map(dept =>
          dept._id === updatedDepartment._id ? updatedDepartment : dept
        )
      );

      // Reset and close modal
      setEditingDepartment(null);
      setIsEditModalOpen(false);

      toast.success('Department updated successfully');
    } catch (error) {
      console.error('Edit Department Error:', error);
      toast.error(error.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      // Delete department
      await deleteDepartment(selectedDepartment._id);

      // Update local state
      setDepartments(prev => {
        // Ensure prev is an array before filtering
        const currentDepartments = Array.isArray(prev) ? prev : [];
        return currentDepartments.filter(dept => dept._id !== selectedDepartment._id);
      });

      // Close modal
      setIsDeleteModalOpen(false);

      toast.success('Department deleted successfully');
    } catch (error) {
      console.error('Delete Department Error:', error);
      toast.error(error.message || 'Failed to delete department');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <FaPlus className="mr-2 inline" /> Add Department
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No departments found. Add a department to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(department => (
              <div
                key={department._id}
                className="bg-white border rounded-lg p-4 flex justify-between items-center"
              >
                {/* …inside your departments.map(…) */}
                <div>
                  <h3
                    className="text-lg font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleViewEmployees(department)}
                  >
                    {department.name}
                  </h3>
                  <button
                    onClick={() => handleViewEmployees(department)}
                    className="
                      inline-flex items-center
                      text-indigo-600 font-semibold
                      hover:text-indigo-800 active:text-indigo-900
                      cursor-pointer
                      transform hover:scale-105
                      transition-transform duration-75 ease-in-out
                      focus:outline-none
                    "
                  >
                    <FaUserFriends className="inline mr-1 align-text-bottom" />
                    {department.workerCount || 0} Employee{(department.workerCount || 0) !== 1 ? 's' : ''}
                  </button>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${department.punchedInCount === department.workerCount && department.workerCount > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      <>{department.punchedInCount} / {department.workerCount} PRESENT</>
                    </span>
                  </div>

                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="text-[#111111] hover:text-gray-700 mr-2"
                    onClick={() => {
                      setEditingDepartment(department);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      setSelectedDepartment(department);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Department"
      >
        <form onSubmit={handleAddDepartment}>
          <div className="form-group mb-4">
            <label className="form-label">Department Name</label>
            <input
              ref={departmentInputRef}
              type="text"
              className="form-input"
              value={departmentName}
              onChange={e => setDepartmentName(e.target.value)}
              placeholder="Enter department name"
              required
              maxLength={50}
            />
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!departmentName.trim()}>
              Add Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDepartment(null);
        }}
        title="Edit Department"
      >
        <form onSubmit={handleEditDepartment}>
          <div className="form-group mb-4">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              value={editingDepartment?.name || ''}
              onChange={e => setEditingDepartment(prev => ({
                ...prev,
                name: e.target.value
              }))}
              placeholder="Enter department name"
              required
              maxLength={50}
            />
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDepartment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!editingDepartment?.name?.trim()}
            >
              Update Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Department Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Department"
      >
        {selectedDepartment && (
          <div>
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedDepartment.name}</strong>?
            </p>
            <p className="mb-4 text-red-600">
              {selectedDepartment.workerCount > 0
                ? `This department has ${selectedDepartment.workerCount} employee(s). You cannot delete it.`
                : 'This action cannot be undone.'}
            </p>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteDepartment}
                disabled={selectedDepartment.workerCount > 0}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
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
                className="flex items-center space-x-4 bg-gray-50 p-3 rounded shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
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
              {/* Performance Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <FaChartLine />
                  </div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Attendance Performance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-xs font-semibold uppercase">This Month</span>
                    <span className="text-2xl font-black text-indigo-700">{employeeSummary.monthly.performance.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-xs font-semibold uppercase">This Year</span>
                    <span className="text-xl font-bold text-gray-700">{employeeSummary.yearly.performance.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {/* Earnings Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <FaMoneyBillWave />
                  </div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Earnings Overview</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-xs font-semibold uppercase">This Month</span>
                    <span className="text-2xl font-black text-emerald-700">₹{employeeSummary.monthly.earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-xs font-semibold uppercase">This Year</span>
                    <span className="text-xl font-bold text-gray-700">₹{employeeSummary.yearly.earnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Last 6 Months Chart-like Table */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500 rounded-lg text-white">
                  <FaCalendarAlt />
                </div>
                <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Last 6 Months Trend</h3>
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
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-bold text-gray-700">{data.month}</td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-full max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${data.performance > 80 ? 'bg-emerald-500' : data.performance > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${data.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 min-w-[40px]">{data.performance.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-sm font-black text-emerald-600">₹{data.earnings.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEmployeeDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
export default DepartmentManagement;