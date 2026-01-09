import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkerLayout from '../../components/layout/WorkerLayout';
import Dashboard from '../../components/worker/Dashboard';
import LeaveApplication from '../../components/worker/ApplyForLeave';
import LeaveRequests from '../../components/worker/LeaveRequests';
import AttendanceReport from '../../components/worker/AttendanceReport';
import Notifications from '../../components/worker/Notifications';
import FaceAttendancePage from '../../components/worker/FaceAttendancePage'; // Import FaceAttendancePage
import RFIDAttendance from '../../components/worker/RFIDAttendance'; // Import RFIDAttendance

const WorkerDashboard = () => {
  // State to track if a test is in progress
  const [isTestInProgress, setIsTestInProgress] = useState(false);

  // Handler to update test state
  const handleTestStateChange = (inProgress) => {
    setIsTestInProgress(inProgress);
  };

  return (
    <WorkerLayout isTestInProgress={isTestInProgress}>
      <Routes>
        <Route path="" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendanceReport />} />
        <Route path="/leave-apply" element={<LeaveApplication />} />
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/face-attendance" element={<FaceAttendancePage />} /> {/* Add FaceAttendance route */}
        <Route path="/rfid-attendance" element={<RFIDAttendance />} /> {/* Add RFIDAttendance route */}
        
        {/* Redirect to dashboard for unknown routes */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </WorkerLayout>
  );
};

export default WorkerDashboard;