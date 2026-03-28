import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createLeave, getLeaveBalance } from '../../services/leaveService';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';

const LEAVE_TYPES = [
  { value: 'Annual Leave', label: 'Annual Leave', noticeDays: 7, balanceKey: 'annualLeave' },
  { value: 'Sick Leave', label: 'Sick Leave / Outpatient', noticeDays: 0, balanceKey: 'sickLeave', requiresCert: true },
  { value: 'Hospitalization Leave', label: 'Hospitalization Leave', noticeDays: 0, balanceKey: 'hospitalizationLeave', requiresCert: true },
  { value: 'Urgent Leave', label: 'Urgent Leave', noticeDays: 0, balanceKey: 'urgentLeave' },
  { value: 'Marriage Leave', label: 'Marriage Leave', noticeDays: 7, balanceKey: 'marriageLeave' },
  { value: 'Paternity Leave', label: 'Paternity Leave', noticeDays: 7, balanceKey: 'paternityLeave' },
  { value: 'Compassionate Leave', label: 'Compassionate Leave', noticeDays: 0, balanceKey: 'compassionateLeave' },
  { value: 'Unpaid Leave', label: 'Unpaid Leave', noticeDays: 7, balanceKey: 'unpaidLeave' },
  { value: 'Home Country Leave', label: 'Home Country Leave', noticeDays: 30, balanceKey: 'homeCountryLeave' },
  { value: 'Personal Leave', label: 'Personal Leave', noticeDays: 7, balanceKey: 'personalLeave' },
  { value: 'Permission', label: 'Time-off / Permission (AM-PM)', noticeDays: 0, balanceKey: null },
  { value: 'Others', label: 'Others', noticeDays: 7, balanceKey: null },
];

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
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [policy, setPolicy] = useState(null);

  // Fetch leave balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setBalanceLoading(true);
        const data = await getLeaveBalance();
        setLeaveBalance(data.leaveBalance);
        setPolicy(data.policy);
      } catch (err) {
        console.error('Could not load leave balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const selectedLeaveType = LEAVE_TYPES.find(lt => lt.value === formData.leaveType);
  const requiresCertificate = selectedLeaveType?.requiresCert;
  const noticeDays = selectedLeaveType?.noticeDays ?? 0;
  const balanceKey = selectedLeaveType?.balanceKey;
  const remainingBalance = balanceKey && leaveBalance ? (leaveBalance[balanceKey] ?? 0) : null;

  const isPermission = formData.leaveType === 'Permission';
  const isHomeCountry = formData.leaveType === 'Home Country Leave';
  const isLongLeave = formData.totalDays >= (policy?.requireReturnTicketDays ?? 7);

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

    // Warn if doctor certificate needed but not uploaded
    if (requiresCertificate && !formData.document) {
      const proceed = window.confirm(
        'A doctor certificate is required for Sick / Hospitalization Leave. Upload it now or you may be asked later. Continue anyway?'
      );
      if (!proceed) return;
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

      {/* Leave Balance Summary */}
      {!balanceLoading && leaveBalance && (
        <Card className="mb-6 bg-blue-50 border border-blue-200">
          <div className="mb-3">
            <h2 className="font-semibold text-gray-800">Your Leave Balance</h2>
            <p className="text-xs text-gray-500">
              {policy?.eligibilityMonths
                ? `Eligible after ${policy.eligibilityMonths} months of employment.`
                : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { label: 'Annual', key: 'annualLeave' },
              { label: 'Sick', key: 'sickLeave' },
              { label: 'Hospital', key: 'hospitalizationLeave' },
              { label: 'Urgent', key: 'urgentLeave' },
              { label: 'Marriage', key: 'marriageLeave' },
              { label: 'Paternity', key: 'paternityLeave' },
              { label: 'Compassion', key: 'compassionateLeave' },
              { label: 'Personal', key: 'personalLeave' },
              { label: 'Unpaid', key: 'unpaidLeave' },
              { label: 'Home Country', key: 'homeCountryLeave' },
            ].map(item => (
              <div key={item.key} className="bg-white rounded-lg p-2 text-center border border-blue-100 shadow-sm">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-lg font-bold ${(leaveBalance[item.key] ?? 0) === 0 ? 'text-red-500' : 'text-blue-700'}`}>
                  {leaveBalance[item.key] ?? 0}
                </p>
                <p className="text-xs text-gray-400">days left</p>
              </div>
            ))}
          </div>
        </Card>
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
                {LEAVE_TYPES.map(lt => (
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
            <label htmlFor="document" className="form-label">
              Supporting Document {requiresCertificate ? <span className="text-red-500">* (required)</span> : '(optional)'}
            </label>
            <input
              type="file"
              id="document"
              name="document"
              className="form-input"
              onChange={handleDocumentChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            />
            <p className="text-xs text-gray-500 mt-1">
              {requiresCertificate
                ? 'Doctor certificate is mandatory for Sick / Hospitalization Leave. Inform within 48 hours.'
                : 'Upload any supporting documents (medical certificates, etc.)'}
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Submit Leave Application'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyForLeave;