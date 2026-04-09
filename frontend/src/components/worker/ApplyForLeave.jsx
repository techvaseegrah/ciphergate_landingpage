import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createLeave, getLeaveBalance } from '../../services/leaveService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';
import LeaveBalanceCard from './LeaveBalanceCard';
import { FiAlertTriangle, FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';

import { useMemo } from 'react';

const ApplyForLeave = () => {
  const { user } = useAuth();
  const { subdomain } = useContext(appContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 0,
    reason: '',
    document: null,
    startTime: '',
    endTime: '',
    isHalfDay: false,
    halfDayPeriod: 'AM',
    returnTicketProvided: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedBalances, setCalculatedBalances] = useState(null);
  const [leaveUsed, setLeaveUsed] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [fileError, setFileError] = useState(false);

  // Fetch leave balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        const data = await getLeaveBalance();
        setCalculatedBalances(data.calculatedBalances);
        setLeaveUsed(data.leaveUsed);
        setPolicy(data.policy);
        setEligibilityData({
          value: data.eligibilityValue,
          unit: data.eligibilityUnit,
          dateOfJoining: data.dateOfJoining
        });
      } catch (err) {
        console.error('Could not load leave balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();

  }, []);

  const dynamicLeaveTypes = useMemo(() => {
    let baseList = [];
    if (policy && Array.isArray(policy)) {
      baseList = policy.map(p => ({
        value: p.label,
        label: p.label,
        noticeDays: p.label === 'Home Country Leave' ? 30 : (
          p.label.toLowerCase().includes('sick') ||
            p.label.toLowerCase().includes('hospital') ||
            p.label.toLowerCase().includes('urgent') ||
            p.label.toLowerCase().includes('compassion')
            ? 0 : 7
        ),
        requiresCert: p.label.toLowerCase().includes('sick') || p.label.toLowerCase().includes('hospital')
      }));
    }

    // Ensure Permission and Others are always appended at the end safely
    if (!baseList.find(l => l.value === 'Permission')) {
      baseList.push({ value: 'Permission', label: 'Time-off / Permission (AM-PM)', noticeDays: 0 });
    }
    if (!baseList.find(l => l.value === 'Others')) {
      baseList.push({ value: 'Others', label: 'Others', noticeDays: 7 });
    }
    return baseList;
  }, [policy]);

  const selectedLeaveType = dynamicLeaveTypes.find(lt => lt.value === formData.leaveType);
  const requiresCertificate = selectedLeaveType?.requiresCert;
  const noticeDays = selectedLeaveType?.noticeDays ?? 0;

  const isPermission = formData.leaveType === 'Permission';
  const isHomeCountry = formData.leaveType === 'Home Country Leave';
  const isOthers = formData.leaveType === 'Others';
  const isLongLeave = formData.totalDays >= (policy?.requireReturnTicketDays ?? 7);

  let remainingBalance = null;
  if (!isPermission && !isOthers && calculatedBalances) {
    const allowed = calculatedBalances[formData.leaveType] ?? 0;
    const used = (leaveUsed && leaveUsed[formData.leaveType]) ? leaveUsed[formData.leaveType] : 0;
    remainingBalance = allowed - used;
  }

  const isDocRequired = true;

  const calculateTotalDays = (start, end, isHalfDay) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) return 0;
    if (isHalfDay) return 0.5;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  let isEligible = true;
  let eligibleDateFormatted = '';

  if (eligibilityData?.dateOfJoining) {
    const joiningDate = new Date(eligibilityData.dateOfJoining);
    const eligibleDate = new Date(joiningDate);
    if (eligibilityData.unit === 'days') {
      eligibleDate.setDate(eligibleDate.getDate() + eligibilityData.value);
    } else {
      eligibleDate.setMonth(eligibleDate.getMonth() + eligibilityData.value);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    isEligible = today >= eligibleDate;
    const dd = String(eligibleDate.getDate()).padStart(2, '0');
    const mm = String(eligibleDate.getMonth() + 1).padStart(2, '0');
    const yyyy = eligibleDate.getFullYear();
    eligibleDateFormatted = `${dd}-${mm}-${yyyy}`;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: val };

      if ((name === 'startDate' || name === 'endDate') && !updated.isHalfDay && !isPermission) {
        updated.totalDays = calculateTotalDays(
          name === 'startDate' ? value : prev.startDate,
          name === 'endDate' ? value : prev.endDate,
          false
        );
      }

      if (name === 'isHalfDay') {
        if (checked) {
          updated.endDate = updated.startDate;
          updated.totalDays = 0.5;
        } else {
          updated.totalDays = calculateTotalDays(updated.startDate, updated.endDate, false);
        }
      }

      if (name === 'leaveType') {
        updated.startTime = '';
        updated.endTime = '';
        updated.isHalfDay = false;
        if (value === 'Permission') {
          updated.totalDays = 0;
        } else {
          updated.totalDays = calculateTotalDays(updated.startDate, updated.endDate, false);
        }
      }

      return updated;
    });
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
      setFileError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subdomain || subdomain === 'main') {
      toast.error('Subdomain is missing, check the URL');
      return;
    }

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isPermission && (!formData.startTime || !formData.endTime)) {
      toast.error('Please provide a start and end time for your permission request.');
      return;
    }

    if (remainingBalance !== null && formData.totalDays > remainingBalance && formData.totalDays > 0) {
      toast.error(`Insufficient ${formData.leaveType} balance. You are requesting ${formData.totalDays} day(s) but only have ${remainingBalance} day(s) remaining.`);
      return;
    }

    if (isDocRequired && !formData.document) {
      toast.error('Supporting document is required');
      setFileError(true);
      const docInput = document.getElementById('document');
      if (docInput) docInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Client-side notice period warning (server enforces it too)
    if (noticeDays > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(formData.startDate);
      const daysUntil = Math.floor((start - today) / (1000 * 60 * 60 * 24));
      if (daysUntil < noticeDays) {
        toast.warning(`This leave type requires ${noticeDays} days notice. Your application may be rejected.`);
      }
    }

    setIsSubmitting(true);
    const formPayload = new FormData();
    formPayload.append('leaveType', formData.leaveType);
    formPayload.append('startDate', formData.startDate);
    formPayload.append('endDate', formData.endDate);
    formPayload.append('reason', formData.reason);
    formPayload.append('subdomain', subdomain);
    formPayload.append('totalDays', formData.totalDays);
    formPayload.append('isHalfDay', formData.isHalfDay);
    formPayload.append('halfDayPeriod', formData.halfDayPeriod || 'AM');
    formPayload.append('returnTicketProvided', formData.returnTicketProvided);

    if (formData.document) {
      formPayload.append('document', formData.document);
    }
    if (isPermission) {
      formPayload.append('startTime', formData.startTime);
      formPayload.append('endTime', formData.endTime);
    }

    try {
      await createLeave(formPayload);
      toast.success('Leave application submitted successfully!');
      setFormData({
        leaveType: 'Annual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalDays: 0,
        reason: '',
        document: null,
        startTime: '',
        endTime: '',
        isHalfDay: false,
        halfDayPeriod: 'AM',
        returnTicketProvided: false,
      });
      setTimeout(() => navigate('/worker/leave-requests'), 1500);
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>

      {/* Leave Balance Summary DASHBOARD */}
      {balanceLoading ? (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[110px]">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : calculatedBalances && Object.keys(calculatedBalances).length > 0 ? (
        <div className="mb-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Your Leave Balance
              <span title="Calculations include any individual or group overrides assigned to you" className="cursor-help text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </span>
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {eligibilityData?.value !== undefined
                ? `Eligible after ${eligibilityData.value} ${eligibilityData.unit} of employment.`
                : 'Loading eligibility...'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.keys(calculatedBalances)
              .filter(label => label !== 'Unpaid Leave' && label !== 'Home Country Leave' && calculatedBalances[label] > 0)
              .map(label => {
                const allowed = calculatedBalances[label];
                const used = leaveUsed?.[label] || 0;
                const remaining = Math.max(0, allowed - used);

                return (
                  <LeaveBalanceCard
                    key={label}
                    title={label}
                    value={remaining}
                  />
                );
              })
            }
          </div>
        </div>
      ) : null}

      {!isEligible && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 font-medium">
          You can apply leave after {eligibleDateFormatted}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            {/* Leave Type */}
            <div className="form-group md:col-span-2">
              <label htmlFor="leaveType" className="form-label">Leave Type <span className="text-red-500">*</span></label>
              <select
                id="leaveType"
                name="leaveType"
                className="form-input"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                {dynamicLeaveTypes.map(lt => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
              {/* Notice period hint */}
              {noticeDays > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Requires at least <strong>{noticeDays} days</strong> prior notice.
                </p>
              )}
              {/* Balance hint */}
              {remainingBalance !== null && (
                <p className={`text-xs mt-1 ${remainingBalance <= 1 ? 'text-red-600' : 'text-green-600'}`}>
                  Balance remaining: <strong>{remainingBalance} day(s)</strong>
                </p>
              )}
              {requiresCertificate && (
                <p className="text-xs text-blue-600 mt-1">
                  Doctor certificate required. Please upload below.
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                disabled={formData.isHalfDay}
                required
              />
            </div>

            {/* Half Day */}
            {!isPermission && (
              <div className="form-group">
                <label className="form-label">Half Day</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isHalfDay"
                      checked={formData.isHalfDay}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Apply for half day</span>
                  </label>
                  {formData.isHalfDay && (
                    <select
                      name="halfDayPeriod"
                      className="form-input py-1"
                      value={formData.halfDayPeriod}
                      onChange={handleChange}
                    >
                      <option value="AM">AM (Morning)</option>
                      <option value="PM">PM (Afternoon)</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Total Days */}
            <div className="form-group">
              <label htmlFor="totalDays" className="form-label">Total Days</label>
              <input
                type="number"
                id="totalDays"
                name="totalDays"
                className="form-input bg-gray-50 border-gray-200"
                value={formData.totalDays}
                readOnly
              />
            </div>

            {/* Permission Time Fields */}
            {isPermission && (
              <>
                <div className="form-group">
                  <label htmlFor="startTime" className="form-label">Start Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    className="form-input"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime" className="form-label">End Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    className="form-input"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Return Ticket */}
          {(isHomeCountry || isLongLeave) && (
            <div className="form-group mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="returnTicketProvided"
                  checked={formData.returnTicketProvided}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-yellow-800">
                  I confirm that I have a return ticket booked.
                  <span className="text-yellow-600 text-xs block">Required for Home Country / long leave approval.</span>
                </span>
              </label>
            </div>
          )}

          {/* Reason */}
          <div className="form-group mb-6">
            <label htmlFor="reason" className="form-label">Reason <span className="text-red-500">*</span></label>
            <textarea
              id="reason"
              name="reason"
              className="form-input rounded-lg"
              rows="4"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Provide details about your leave request"
              required
            ></textarea>
          </div>

          {/* Document Upload */}
          <div className="form-group mb-6">
            <label htmlFor="document" className="form-label flex items-center gap-1">
              Supporting Document <span className="text-red-500">*</span>
            </label>

            {!formData.document && (
              <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-800 text-xs shadow-sm shadow-red-100/50">
                <FiAlertTriangle className="mt-0.5 flex-shrink-0 text-red-500" />
                <p className="font-medium">A supporting document is strictly mandatory for all leave requests and must be uploaded to proceed.</p>
              </div>
            )}

            {!formData.document ? (
              <div className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${fileError ? 'border-red-300 bg-red-50 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/50'}`}>
                <input
                  type="file"
                  id="document"
                  name="document"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleDocumentChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <FiUploadCloud className={`h-10 w-10 mb-3 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                  <p className={`text-sm font-semibold ${fileError ? 'text-red-700' : 'text-gray-700'}`}>
                    {fileError ? 'File Required' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
                    <FiFileText size={24} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">{formData.document.name}</span>
                    <span className="text-xs text-gray-500">{(formData.document.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Remove file"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-[12px] text-red-600 mt-2 font-medium flex items-center gap-1">
                <FiAlertTriangle size={12} /> Please upload a document
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isEligible || (isDocRequired && !formData.document)}
            >
              {isSubmitting ? <Spinner size="sm" /> : 'Submit Leave Application'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyForLeave;