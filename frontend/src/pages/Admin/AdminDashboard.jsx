import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../../components/admin/Dashboard';
import WorkerManagement from '../../components/admin/WorkerManagement';
import LeaveManagement from '../../components/admin/LeaveManagement';
import DepartmentManagement from '../../components/admin/DepartmentManagement';
import SalaryManagement from '../../components/admin/SalaryManagement';
import HolidayManagement from '../../components/admin/HolidayManagement';
import FaceAttendancePage from '../../components/admin/FaceAttendancePage';
import FaceTest from '../../components/admin/FaceTest'; // Import FaceTest
import NotificationManagement from '../../components/admin/NotificationManagement'; // Import NotificationManagement

const AdminDashboard = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="workers" element={<WorkerManagement />} />
      <Route path="salary" element={<SalaryManagement />} />
      <Route path="leaves" element={<LeaveManagement />} />
      <Route path="holidays" element={<HolidayManagement />} />
      <Route path="departments" element={<DepartmentManagement />} />
      <Route path="face-attendance" element={<FaceAttendancePage />} />
      <Route path="face-test" element={<FaceTest />} /> {/* Add FaceTest route */}
      <Route path="notifications" element={<NotificationManagement />} /> {/* Add NotificationManagement route */}
      {/* Redirect to dashboard for unknown routes */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminDashboard;