import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaChevronDown, FaChevronUp, FaSearch, FaBusinessTime, FaUserClock, FaBalanceScale, FaEye, FaFileAlt } from 'react-icons/fa';
import { MdPolicy, MdRefresh } from 'react-icons/md';
import {
  getAllLeaves, markLeavesAsViewedByAdmin, updateLeaveStatus,
  getWorkerLeaveSummary, resetLeaveBalance, updateWorkerLeaveBalance
} from '../../services/leaveService';
import appContext from '../../context/AppContext';
import Spinner from '../common/Spinner';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Button from '../common/Button';
import AttachmentViewerModal from '../common/AttachmentViewerModal';

const LEAVE_TYPE_LABELS = {
  'Annual Leave': 'Annual Leave',
  'Sick Leave': 'Sick Leave / Outpatient',
  'Hospitalization Leave': 'Hospitalization Leave',
  'Urgent Leave': 'Urgent Leave',
  'Marriage Leave': 'Marriage Leave',
  'Paternity Leave': 'Paternity Leave',
  'Compassionate Leave': 'Compassionate Leave',
  'Unpaid Leave': 'Unpaid Leave',
  'Home Country Leave': 'Home Country Leave',
  'Personal Leave': 'Personal Leave',
  'Permission': 'Time-off / Permission (AM-PM)',
  'Others': 'Others'
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [activeView, setActiveView] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { subdomain } = useContext(appContext);

  // Leave summary / balance modal
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Approve modal with notes
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Edit balance inside summary modal
  const [editBalanceMode, setEditBalanceMode] = useState(false);
  const [editableBalance, setEditableBalance] = useState({});
  const [savingBalance, setSavingBalance] = useState(false);
  const [currentSummaryWorkerId, setCurrentSummaryWorkerId] = useState(null);
  
  // Attachment viewer modal
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerFileName, setViewerFileName] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [subdomain]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeView, activeTypeFilter, leaves]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const leavesData = await getAllLeaves({ subdomain });
      setLeaves(leavesData);
      setFilteredLeaves(leavesData);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...leaves];

    if (activeView !== 'all') {
      result = result.filter(leave => leave.status === activeView);
    }
    if (activeTypeFilter !== 'all') {
      result = result.filter(leave => leave.leaveType === activeTypeFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(leave =>
        leave.worker?.name.toLowerCase().includes(term) ||
        leave.leaveType.toLowerCase().includes(term)
      );
    }

    setFilteredLeaves(result);
  };

  const handleReview = async (leaveId, status, note = '') => {
    setProcessing(prev => ({ ...prev, [leaveId]: true }));
    try {
      const updatedLeave = await updateLeaveStatus(leaveId, status, note);
      setLeaves(leaves.map(leave =>
        leave._id === leaveId ? { ...leave, status, worker: updatedLeave.worker || leave.worker } : leave
      ));
      await markLeavesAsViewedByAdmin(leaveId);
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      setIsApproveModalOpen(false);
      setAdminNote('');
      setSelectedLeaveForApproval(null);
    } catch (error) {
      toast.error(error.message || `Failed to ${status.toLowerCase()} leave`);
    } finally {
      setProcessing(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const openApproveModal = (leave) => {
    setSelectedLeaveForApproval(leave);
    setAdminNote('');
    setIsApproveModalOpen(true);
  };

  const handleViewLeaveSummary = async (workerId) => {
    try {
      setSummaryLoading(true);
      setIsSummaryModalOpen(true);
      setEditBalanceMode(false);
      setEditableBalance({});
      setCurrentSummaryWorkerId(workerId);
      const data = await getWorkerLeaveSummary(workerId);
      setSummaryData(data);
    } catch (err) {
      toast.error('Failed to load leave summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleStartEditBalance = () => {
    setEditableBalance({ ...(summaryData?.leaveBalance || {}) });
    setEditBalanceMode(true);
  };

  const handleSaveBalance = async () => {
    if (!currentSummaryWorkerId) return;
    setSavingBalance(true);
    try {
      const result = await updateWorkerLeaveBalance(currentSummaryWorkerId, editableBalance);
      setSummaryData(prev => ({ ...prev, leaveBalance: result.leaveBalance }));
      setEditBalanceMode(false);
      toast.success('Leave balance updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update leave balance');
    } finally {
      setSavingBalance(false);
    }
  };

  const handleCancelEditBalance = () => {
    setEditBalanceMode(false);
    setEditableBalance({});
  };

  const handleResetLeaveBalance = async () => {
    if (!window.confirm('Reset all leave balances for this year? This cannot be undone.')) return;
    try {
      const result = await resetLeaveBalance(subdomain);
      toast.success(result.message);
    } catch (err) {
      toast.error(err.message || 'Failed to reset leave balances');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveView('all');
    setActiveTypeFilter('all');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return format(time, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const calculatePermissionDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm);
      if (mins <= 0) return '';
      const h = Math.floor(mins / 60), m = mins % 60;
      return h > 0 && m > 0 ? `(${h}h ${m}m)` : h > 0 ? `(${h}h)` : `(${m}m)`;
    } catch {
      return '';
    }
  };

  const getLeaveTypeOptions = () => {
    const types = [...new Set(leaves.map(l => l.leaveType))];
    return ['all', ...types];
  };

  const LeaveItem = ({ leave }) => (
    <Card className={`mb-4 border-t-4 ${leave.status === 'Approved' ? 'border-green-500' :
      leave.status === 'Rejected' ? 'border-red-500' :
        'border-yellow-500'
      }`}>
      <div className="flex justify-between flex-wrap gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-gray-800">{leave.worker?.name || 'Unknown Employee'}</p>
            {leave.isHalfDay && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                Half-day ({leave.halfDayPeriod || 'AM'})
              </span>
            )}
            {leave.returnTicketRequired && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${leave.returnTicketProvided ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Ticket: {leave.returnTicketProvided ? 'Provided' : 'Not Provided'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType} • Applied: {new Date(leave.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
            {' '}• <span className="font-medium">{leave.leaveType === 'Permission'
              ? calculatePermissionDuration(leave.startTime, leave.endTime) || 'Time-off'
              : `${leave.totalDays} day(s)`
            }</span>
          </p>
          {leave.leaveType === 'Permission' && leave.startTime && leave.endTime && (
            <p className="text-sm text-blue-700 font-medium">
              {formatTime(leave.startTime)} – {formatTime(leave.endTime)} {calculatePermissionDuration(leave.startTime, leave.endTime)}
            </p>
          )}
          {leave.doctorCertificateProvided && (
            <p className="text-xs text-green-600 mt-1">Doctor certificate uploaded</p>
          )}
          {(leave.leaveType === 'Sick Leave' || leave.leaveType === 'Hospitalization Leave') && !leave.doctorCertificateProvided && (
            <p className="text-xs text-red-500 mt-1">Doctor certificate not uploaded</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Notice: {leave.noticeDaysBefore} day(s) before</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {leave.status}
          </span>
          <button
            onClick={() => handleViewLeaveSummary(leave.worker?._id)}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
            title="View leave balance"
          >
            <FaBalanceScale size={12} />
            Balance
          </button>
        </div>
      </div>

      <p className="mt-2 text-gray-600 text-sm">Reason: {leave.reason}</p>
      {leave.adminNote && (
        <p className="mt-1 text-xs text-gray-500 italic">Admin note: {leave.adminNote}</p>
      )}

      {leave.document && (
        <div className="mt-3">
          <button
            onClick={() => {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').split('/api')[0];
                setViewerUrl(`${baseUrl}/uploads/${leave.document}`);
                setViewerFileName(leave.document);
                setIsViewerOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all text-xs font-semibold shadow-sm"
          >
            <FaFileAlt />
            <span>View Attachment</span>
            <FaEye className="ml-1 opacity-70" />
          </button>
        </div>
      )}

      {leave.status === 'Pending' && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => openApproveModal(leave)}
            disabled={processing[leave._id]}
            className="px-3 py-1.5 bg-[#111111] text-white text-sm rounded hover:bg-white hover:text-[#111111] border-2 border-[#111111] transition-colors"
          >
            {processing[leave._id] ? <Spinner size="sm" /> : 'Approve'}
          </button>
          <button
            onClick={() => handleReview(leave._id, 'Rejected')}
            disabled={processing[leave._id]}
            className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-white hover:text-gray-500 border-2 border-gray-500 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </Card>
  );

  const displayLeaves = showAllLeaves ? filteredLeaves : filteredLeaves.slice(0, 5);

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-xs cursor-pointer whitespace-nowrap ${activeView === name
      ? 'bg-[#111111] text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-[#111111] hover:text-white'
    }`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleResetLeaveBalance}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            title="Reset annual leave balances for all employees"
          >
            <MdRefresh /> Reset Annual Balance
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner size="md" />
      ) : leaves.length === 0 ? (
        <p>No leave requests submitted yet.</p>
      ) : (
        <div>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name or leave type"
                  className="pl-10 pr-4 py-2 w-full border rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-[#111111] hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
            {['all', 'Pending', 'Approved', 'Rejected'].map(tab => (
              <div key={tab} className={tabClass(tab)} onClick={() => setActiveView(tab)}>
                {tab === 'all' ? 'All' : tab}
              </div>
            ))}
          </div>

          {/* Leave type filter */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
            {getLeaveTypeOptions().map(type => (
              <div
                key={type}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap border ${activeTypeFilter === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                onClick={() => setActiveTypeFilter(type)}
              >
                {type === 'all' ? 'All Types' : `${LEAVE_TYPE_LABELS[type] || type}`}
              </div>
            ))}
          </div>

          {/* List header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Leave Requests</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Showing {displayLeaves.length} of {filteredLeaves.length}
              </span>
              <button
                onClick={() => setShowAllLeaves(!showAllLeaves)}
                className="text-[#111111] text-sm flex items-center"
              >
                {showAllLeaves ? <>Show Less <FaChevronUp className="ml-1" /></> : <>Show All <FaChevronDown className="ml-1" /></>}
              </button>
            </div>
          </div>

          {displayLeaves.length === 0 ? (
            <div className="bg-white p-4 rounded-lg text-center">
              <p>No {activeView !== 'all' ? activeView : ''} leaves found with the current filters.</p>
            </div>
          ) : (
            <>
              {displayLeaves.map(leave => (
                <LeaveItem key={leave._id} leave={leave} />
              ))}
              {!showAllLeaves && filteredLeaves.length > 5 && (
                <button
                  onClick={() => setShowAllLeaves(true)}
                  className="mt-4 w-full py-2 text-sm text-[#111111] border border-[#111111] rounded-full hover:bg-[#111111] hover:text-white"
                >
                  View All ({filteredLeaves.length}) Leaves
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Approve with Note Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedLeaveForApproval(null); }}
        title="Approve Leave"
      >
        {selectedLeaveForApproval && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold">{selectedLeaveForApproval.worker?.name}</p>
              <p className="text-sm text-gray-600">{selectedLeaveForApproval.leaveType} • {selectedLeaveForApproval.totalDays} day(s)</p>
              <p className="text-sm text-gray-600">{new Date(selectedLeaveForApproval.startDate).toLocaleDateString()} – {new Date(selectedLeaveForApproval.endDate).toLocaleDateString()}</p>
              {selectedLeaveForApproval.returnTicketRequired && !selectedLeaveForApproval.returnTicketProvided && (
                <p className="text-xs text-red-500 mt-1">Return ticket not confirmed by employee</p>
              )}
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Admin Note (optional)</label>
              <textarea
                className="form-input rounded-lg"
                rows={3}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Add any approval notes or conditions..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsApproveModalOpen(false); setSelectedLeaveForApproval(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => handleReview(selectedLeaveForApproval._id, 'Approved', adminNote)}>
                Confirm Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Leave Balance Summary Modal */}
      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => { setIsSummaryModalOpen(false); setSummaryData(null); setEditBalanceMode(false); }}
        title="Employee Leave Summary"
      >
        {summaryLoading ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : summaryData ? (
          <div>
            <div className="mb-4">
              <p className="font-semibold text-lg">{summaryData.worker?.name}</p>
              <p className="text-sm text-gray-500">{summaryData.worker?.department}</p>
              <p className="text-xs text-gray-400">
                Joined: {summaryData.dateOfJoining ? new Date(summaryData.dateOfJoining).toLocaleDateString() : 'N/A'} •
                Eligibility after: {summaryData.eligibilityMonths} months
              </p>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">Leave Balance</h2>
              {!editBalanceMode ? (
                <button
                  onClick={handleStartEditBalance}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Edit Balance
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBalance}
                    disabled={savingBalance}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {savingBalance ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEditBalance}
                    className="text-xs px-3 py-1 bg-gray-400 text-white rounded-full hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(summaryData.leaveBalance || {}).map(([key, val]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                const used = summaryData.leaveUsed?.[key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())] || 0;
                return (
                  <div key={key} className="bg-gray-50 p-2 rounded border text-sm">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    {editBalanceMode ? (
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-blue-300 rounded px-2 py-1 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={editableBalance[key] ?? val}
                        onChange={e => setEditableBalance(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      />
                    ) : (
                      <>
                        <p className="font-bold text-blue-700">{val} <span className="text-gray-400 font-normal text-xs">remaining</span></p>
                        {used > 0 && <p className="text-xs text-gray-400">{used} used this year</p>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="font-medium text-gray-700 mb-2">Department Policies</h3>
            <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-1">
              <p>Annual Leave Limit: <strong>{summaryData.policy?.annualLeaveLimit} days</strong></p>
              <p>Sick Leave Limit: <strong>{summaryData.policy?.sickLeaveLimit} days</strong></p>
              <p>Hospitalization Limit: <strong>{summaryData.policy?.hospitalizationLeaveLimit} days</strong></p>
              <p>Normal Notice: <strong>{summaryData.policy?.normalNoticeDays} days</strong></p>
              <p>Home Country Notice: <strong>{summaryData.policy?.homeCountryNoticeDays} days</strong></p>
              <p>Return Ticket Required: <strong>≥{summaryData.policy?.requireReturnTicketDays} days leave</strong></p>
              {summaryData.policy?.preventContinuousLeaveDays > 0 && (
                <p>Max Continuous Leave: <strong>{summaryData.policy.preventContinuousLeaveDays - 1} days</strong></p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No summary available</p>
        )}
      </Modal>

      {/* Attachment Viewer Modal */}
      <AttachmentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileUrl={viewerUrl}
        fileName={viewerFileName}
      />
    </div>
  );
};

export default LeaveManagement;