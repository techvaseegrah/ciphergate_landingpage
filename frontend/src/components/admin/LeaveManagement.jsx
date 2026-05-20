import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FaChevronDown, FaChevronUp, FaSearch, FaBusinessTime, FaUserClock, FaBalanceScale, FaEye, FaFileAlt } from 'react-icons/fa';
import { MdPolicy, MdRefresh } from 'react-icons/md';
import { FiCalendar } from 'react-icons/fi';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const LeaveItem = ({ leave }) => (
    <div className={`mb-4 p-5 rounded-[20px] bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all font-poppins relative overflow-hidden group hover:shadow-md hover:border-slate-200 ${
      leave.status === 'Approved' ? 'border-l-[6px] border-l-emerald-500' :
      leave.status === 'Rejected' ? 'border-l-[6px] border-l-rose-500' :
      'border-l-[6px] border-l-amber-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <img
            src={leave.worker?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.worker?.name || 'User')}&background=F1F5F9&color=64748B&bold=true`}
            alt=""
            className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{leave.worker?.name || 'Unknown Employee'}</h3>
            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1">
              <span>{LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType}</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span>Applied: {formatDate(leave.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] ${
          leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
          leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
          'bg-amber-50 text-amber-600'
        }`}>
          {leave.status}
        </div>
      </div>

      <div className="bg-slate-50 rounded-[16px] p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-[13px]">
            <FiCalendar className="text-slate-400" size={14} />
            <span>{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Duration:</span>
             <span className="text-slate-900 font-bold text-[13px]">{leave.leaveType === 'Permission'
               ? calculatePermissionDuration(leave.startTime, leave.endTime) || 'Time-off'
               : `${leave.totalDays} day(s)`
             }</span>
          </div>
        </div>
        {leave.leaveType === 'Permission' && leave.startTime && leave.endTime && (
          <p className="text-[12px] text-slate-400 font-normal mt-2">
            {formatTime(leave.startTime)} – {formatTime(leave.endTime)}
          </p>
        )}
      </div>

      <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-[1.4]">
        <span className="font-semibold text-slate-900 mr-1">Reason:</span>
        {leave.reason}
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => handleViewLeaveSummary(leave.worker?._id)}
          className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[12px] font-medium active:scale-95 transition-all shadow-lg shadow-slate-900/10"
        >
          View Balance
        </button>
        
        {leave.document && (
          <button
            onClick={() => {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').split('/api')[0];
                setViewerUrl(`${baseUrl}/uploads/${leave.document}`);
                setViewerFileName(leave.document);
                setIsViewerOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-all"
            title="View Attachment"
          >
            <FaFileAlt size={16} />
          </button>
        )}
      </div>

      {leave.status === 'Pending' && (
        <div className="mt-4 flex gap-3 border-t border-slate-50 pt-4">
          <button
            onClick={() => openApproveModal(leave)}
            disabled={processing[leave._id]}
            className="flex-1 h-[44px] bg-emerald-500 text-white rounded-[12px] text-[14px] font-medium active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
          >
            {processing[leave._id] ? <Spinner size="sm" /> : 'Approve'}
          </button>
          <button
            onClick={() => handleReview(leave._id, 'Rejected')}
            disabled={processing[leave._id]}
            className="flex-1 h-[44px] bg-white text-rose-500 border border-rose-100 rounded-[12px] text-[14px] font-medium active:scale-95 transition-all shadow-sm"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  const displayLeaves = showAllLeaves ? filteredLeaves : filteredLeaves.slice(0, 5);



  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-[18px] font-semibold text-slate-900 tracking-tight">Leaves</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleResetLeaveBalance}
            className="h-[44px] px-4 bg-slate-900 text-white text-[14px] font-medium rounded-[12px] shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
            title="Reset annual leave balances for all employees"
          >
            <MdRefresh size={18} /> Reset Balance
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
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'Pending', 'Approved', 'Rejected'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveView(tab)}
                className={`h-9 px-5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                  activeView === tab
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Requests' : tab}
              </button>
            ))}
          </div>

          {/* Leave type filter */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
            {getLeaveTypeOptions().map(type => (
              <button
                key={type}
                onClick={() => setActiveTypeFilter(type)}
                className={`h-8 px-4 rounded-full text-[11px] font-medium transition-all whitespace-nowrap border ${
                  activeTypeFilter === type
                  ? 'bg-slate-100 text-slate-900 border-slate-200'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                }`}
              >
                {type === 'all' ? 'All Types' : `${LEAVE_TYPE_LABELS[type] || type}`}
              </button>
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

              <p className="text-sm text-gray-600">{formatDate(selectedLeaveForApproval.startDate)} – {formatDate(selectedLeaveForApproval.endDate)}</p>
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
                    <p className="text-[#475569] text-xs mb-1">{label}</p>
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