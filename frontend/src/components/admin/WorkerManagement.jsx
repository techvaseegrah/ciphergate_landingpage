import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Added useLocation import
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaEye, FaEyeSlash, FaDownload, FaBuilding } from 'react-icons/fa';
import { getWorkers, createWorker, updateWorker, deleteWorker, getUniqueId } from '../../services/workerService';
import { getDepartments } from '../../services/departmentService';
import { getSettings } from '../../services/settingsService';
import { getCurrentUser } from '../../services/authService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatUtils';
import FaceCapture from './FaceCapture'; // Import FaceCapture component
import PremiumUpgradeModal from '../common/PremiumUpgradeModal'; // Import the premium upgrade modal
import DocumentViewerModal from './DocumentViewerModal';

const WorkerManagement = () => {
  const location = useLocation(); // Added useLocation hook
  const nameInputRef = useRef(null);
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]); // <-- This line was missing
  const [globalLeavePolicy, setGlobalLeavePolicy] = useState([
    { type: 'annual', label: 'Annual' }, { type: 'sick', label: 'Sick' },
    { type: 'hospital', label: 'Hospital' }, { type: 'urgent', label: 'Urgent' },
    { type: 'marriage', label: 'Marriage' }, { type: 'paternity', label: 'Paternity' },
    { type: 'compassion', label: 'Compassion' }, { type: 'personal', label: 'Personal' },
    { type: 'unpaid', label: 'Unpaid' }, { type: 'homeCountry', label: 'Home Country' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [passTypeFilter, setPassTypeFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [resignationFilter, setResignationFilter] = useState('');
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false); // State for face capture modal
  const [selectedWorkerForFace, setSelectedWorkerForFace] = useState(null); // Worker selected for face capture
  const [workerFaceEmbeddings, setWorkerFaceEmbeddings] = useState([]); // Store face embeddings for worker
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false); // State for premium upgrade modal
  const [accountType, setAccountType] = useState('free'); // State for account type
  const [currentUser, setCurrentUser] = useState(null); // State for current user data

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photo: file }));
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);

  // Helper to resolve backend file URL correctly
  const getFullFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiBase.replace('/api', '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${serverUrl}${normalizedPath}`;
  };

  const handleViewDocument = (worker) => {
    if (!worker?.idProofUrl) return;
    
    const url = worker.idProofUrl;
    let type = 'unknown';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) type = 'pdf';
    else if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png')) type = 'image';
    else if (lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx')) type = 'excel';
    
    // Extract a readable name
    const name = url.split('/').pop() || 'ID Document';

    setActiveDocument({ url, name, type, workerId: worker._id });
    setIsDocumentViewerOpen(true);
  };

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    rfid: '',
    salary: 0,
    batch: '',
    password: '',
    confirmPassword: '',
    department: '',
    photo: '',
    faceEmbeddings: [],
    // New fields
    employeeId: '',
    pinNumber: '',
    contactNumber: '',
    email: '',
    gender: '',
    dob: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    dateOfExit: '',
    resignationStatus: 'Active',
    exitReasonType: '',
    exitReasonDescription: '',
    workPassType: '',
    passportNumber: '',
    nationality: '',
    passExpiryDate: '',
    address: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
    relationship: '',
    bankAccountNumber: '',
    qualification: '',
    idProofFile: null,
    leaveOverrides: {
      annual: '', sick: '', hospital: '', urgent: '', marriage: '', 
      paternity: '', compassion: '', personal: '', unpaid: '', homeCountry: ''
    }
  });

  // Subdomain
  const { subdomain, settings } = useContext(appContext);

  // Load workers, departments and user account info
  const loadData = async () => {
    setIsLoading(true);
    setIsLoadingDepartments(true);

    try {
      // Fetch data individually to prevent one failure from blocking everything
      const workersPromise = getWorkers({ subdomain }).catch(err => {
        console.error('Failed to fetch workers:', err);
        return [];
      });
      
      const departmentsPromise = getDepartments({ subdomain }).catch(err => {
        console.error('Failed to fetch departments:', err);
        return [];
      });
      
      const settingsPromise = getSettings({ subdomain }).catch(err => {
        console.error('Failed to fetch settings:', err);
        return {};
      });
      
      const userPromise = Promise.resolve(getCurrentUser());

      const [workersData, departmentsData, settingsData, userData] = await Promise.all([
        workersPromise,
        departmentsPromise,
        settingsPromise,
        userPromise
      ]);

      setWorkers(Array.isArray(workersData) ? workersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      
      if (settingsData) {
        setBatches(settingsData.batches || []);
        if (Array.isArray(settingsData.leavePolicy)) {
          setGlobalLeavePolicy(settingsData.leavePolicy);
        }
      }

      setAccountType(userData?.accountType || 'free');
      setCurrentUser(userData);
    } catch (error) {
      console.error('Unexpected error in loadData:', error);
      toast.error('An unexpected error occurred while loading data');
    } finally {
      setIsLoading(false);
      setIsLoadingDepartments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getWorkerId = async () => {
    await getUniqueId()
      .then((response) => {
        setFormData(prev => ({ ...prev, rfid: response.rfid }));
      })
      .catch((e) => console.log(e.message));
  }

  useEffect(() => {
    getWorkerId();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // When status goes back to Active, clear exit fields
    if (name === 'resignationStatus' && value === 'Active') {
      setFormData(prev => ({
        ...prev,
        resignationStatus: 'Active',
        exitReasonType: '',
        exitReasonDescription: '',
        dateOfExit: ''
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeaveOverrideChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      leaveOverrides: {
        ...prev.leaveOverrides,
        [name]: value === '' ? '' : Number(value)
      }
    }));
  };

  // Handle ID proof file upload
  const handleIdProofUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPEG, PNG, and Excel files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > maxSize) {
      toast.error('File size must not exceed 5MB.');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, idProofFile: file }));
  };

  const filteredWorkers = Array.isArray(workers)
    ? workers.filter(worker => {
      // Search filter
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = (
        worker.name?.toLowerCase().includes(searchStr) ||
        worker.username?.toLowerCase().includes(searchStr) ||
        worker.department?.name?.toLowerCase().includes(searchStr) ||
        (typeof worker.department === 'string' && worker.department.toLowerCase().includes(searchStr)) ||
        worker.rfid?.toLowerCase().includes(searchStr) ||
        worker.employeeId?.toLowerCase().includes(searchStr)
      );

      // Work Pass Type filter
      const matchesPassType = passTypeFilter === '' || worker.workPassType === passTypeFilter;

      // Resignation filter
      const matchesResignation = resignationFilter === '' ||
        (resignationFilter === 'Active' && (!worker.resignationStatus || worker.resignationStatus === 'Active')) ||
        (resignationFilter === 'Resigned' && worker.resignationStatus === 'Resigned');

      // Expiry Status filter
      let matchesExpiry = true;
      if (expiryFilter !== '') {
        if (!worker.passExpiryDate) {
          matchesExpiry = false;
        } else {
          const expiry = new Date(worker.passExpiryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          if (expiryFilter === 'Expired') {
            matchesExpiry = diffDays < 0;
          } else if (expiryFilter === 'Expiring') {
            matchesExpiry = diffDays >= 0 && diffDays <= 30;
          } else if (expiryFilter === 'Valid') {
            matchesExpiry = diffDays > 30;
          }
        }
      }

      return matchesSearch && matchesPassType && matchesResignation && matchesExpiry;
    })
    : [];

  useEffect(() => {
    if (isAddModalOpen) {
      nameInputRef.current?.focus();
    }
  }, [isAddModalOpen]);

  // Open add worker modal
  const openAddModal = () => {
    setFormData(prev => ({
      ...prev,
      name: '',
      username: '',
      password: '',
      department: departments.length > 0 ? departments[0]._id : '',
      photo: '',
      batch: batches.length > 0 ? batches[0].batchName : '',
      faceEmbeddings: [],
      // New fields
      employeeId: '',
      pinNumber: '',
      contactNumber: '',
      email: '',
      gender: '',
      dob: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      dateOfExit: '',
      resignationStatus: 'Active',
      exitReasonType: '',
      exitReasonDescription: '',
      workPassType: '',
      passportNumber: '',
      nationality: '',
      passExpiryDate: '',
      address: '',
      emergencyContactNumber: '',
      emergencyContactName: '',
      relationship: '',
      bankAccountNumber: '',
      qualification: '',
      idProofFile: null,
      leaveOverrides: {
        annual: '', sick: '', hospital: '', urgent: '', marriage: '', 
        paternity: '', compassion: '', personal: '', unpaid: '', homeCountry: ''
      }
    }));
    getWorkerId();
    setIsAddModalOpen(true);
  };

  // Open edit worker modal
  const openEditModal = (worker) => {
    const departmentId = typeof worker.department === 'object'
      ? worker.department._id
      : (departments.find(dept => dept.name === worker.department)?._id || worker.department);

    setSelectedWorker(worker);
    setFormData({
      name: worker.name || '',
      username: worker.username || '',
      department: departmentId,
      photo: worker.photo || '',
      salary: worker.salary || 0,
      password: '',
      confirmPassword: '',
      batch: worker.batch || '',
      faceEmbeddings: worker.faceEmbeddings || [],
      // New fields
      employeeId: worker.employeeId || '',
      pinNumber: worker.pinNumber || '',
      contactNumber: worker.contactNumber || '',
      email: worker.email || '',
      gender: worker.gender || '',
      dob: worker.dob ? new Date(worker.dob).toISOString().split('T')[0] : '',
      dateOfJoining: worker.dateOfJoining ? new Date(worker.dateOfJoining).toISOString().split('T')[0] : '',
      dateOfExit: worker.dateOfExit ? new Date(worker.dateOfExit).toISOString().split('T')[0] : '',
      resignationStatus: worker.resignationStatus || 'Active',
      exitReasonType: worker.exitReasonType || '',
      exitReasonDescription: worker.exitReasonDescription || '',
      workPassType: worker.workPassType || '',
      passportNumber: worker.passportNumber || '',
      nationality: worker.nationality || '',
      passExpiryDate: worker.passExpiryDate ? new Date(worker.passExpiryDate).toISOString().split('T')[0] : '',
      address: worker.address || '',
      emergencyContactNumber: worker.emergencyContactNumber || '',
      emergencyContactName: worker.emergencyContactName || '',
      relationship: worker.relationship || '',
      bankAccountNumber: worker.bankAccountNumber || '',
      qualification: worker.qualification || '',
      rfid: worker.rfid || '',
      idProofFile: null,
      leaveOverrides: {
        annual: worker.leaveOverrides?.annual ?? '',
        sick: worker.leaveOverrides?.sick ?? '',
        hospital: worker.leaveOverrides?.hospital ?? '',
        urgent: worker.leaveOverrides?.urgent ?? '',
        marriage: worker.leaveOverrides?.marriage ?? '',
        paternity: worker.leaveOverrides?.paternity ?? '',
        compassion: worker.leaveOverrides?.compassion ?? '',
        personal: worker.leaveOverrides?.personal ?? '',
        unpaid: worker.leaveOverrides?.unpaid ?? '',
        homeCountry: worker.leaveOverrides?.homeCountry ?? ''
      }
    });
    setIsEditModalOpen(true);
  };

  // Open delete worker modal
  const openDeleteModal = (worker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  // Open view worker modal
  const openViewModal = (worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };

  // Open face capture modal
  const openFaceCaptureModal = (worker) => {
    setSelectedWorkerForFace(worker);
    setWorkerFaceEmbeddings(worker.faceEmbeddings || []);
    setShowFaceCapture(true);
  };

  // Handle face embeddings captured
  const handleFacesCaptured = async (faces) => {
    const embeddings = faces.map(face => face.embedding);
    setWorkerFaceEmbeddings(embeddings);

    // If we're editing an existing worker, update their face embeddings immediately
    if (selectedWorkerForFace) {
      try {
        const updateData = {
          faceEmbeddings: embeddings
        };

        const updatedWorker = await updateWorker(selectedWorkerForFace._id, updateData);

        // Update the workers list
        setWorkers(prev =>
          prev.map(worker =>
            worker._id === selectedWorkerForFace._id ? updatedWorker : worker
          )
        );

        toast.success('Face data captured and saved successfully');
      } catch (error) {
        console.error('Error saving face data:', error);
        toast.error('Failed to save face data');
      }
    }

    setShowFaceCapture(false);
  };



  const handleAddWorker = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedSalary = String(formData.salary).trim();

    // Validation checks
    if (!subdomain) {
      toast.error('Subdomain is missing, check the url');
      return;
    }

    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }

    if (!trimmedUsername) {
      toast.error('Username is required');
      return;
    }

    if (formData.passExpiryDate) {
      const expiry = new Date(formData.passExpiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        toast.error('Expiry date must be a future date');
        return;
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email format');
      return;
    }

    if (!trimmedSalary || trimmedSalary === '') {
      toast.error('Salary is required');
      return;
    }

    if (isNaN(Number(trimmedSalary)) || Number(trimmedSalary) <= 0) {
      toast.error('Salary must be a positive number');
      return;
    }

    if (!trimmedPassword) {
      toast.error('Password is required');
      return;
    }

    if (!formData.department) {
      toast.error('Department is required');
      return;
    }

    if (!formData.rfid) {
      toast.error('Unique ID is required');
      return;
    }

    if (!formData.batch) {
      toast.error('Batch is required');
      return;
    }

    // Exit workflow validation removed as requested

    try {
      const newWorker = await createWorker({
        ...formData,
        name: trimmedName,
        username: trimmedUsername,
        rfid: formData.rfid,
        salary: Number(trimmedSalary),
        subdomain,
        password: trimmedPassword,
        photo: formData.photo || '',
        batch: formData.batch,
        faceEmbeddings: workerFaceEmbeddings
      });

      setWorkers(prev => [...prev, newWorker]);
      setIsAddModalOpen(false);
      toast.success('Employee added successfully');
      loadData();
    } catch (error) {
      console.error('Add Employee Error:', error);
      if (error.message && error.message.includes('Free account limit reached')) {
        toast.error('Free account limit reached!');
        setShowPremiumUpgrade(true);
      } else {
        toast.error(error.message || 'Failed to add employee');
      }
    }
  };

  const handleEditWorker = async (e) => {
    e.preventDefault();

    // Validate mandatory inputs
    if (!formData.name || !formData.username || !formData.department) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (formData.passExpiryDate) {
      const expiry = new Date(formData.passExpiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry <= today) {
        toast.error('Expiry date must be a future date');
        return;
      }
    }

    // Password validation if provided
    if (formData.password) {

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

    // Exit workflow validation removed as requested

    try {
      const updateData = {
        ...formData,
        faceEmbeddings: workerFaceEmbeddings
      };

      // Only add password if provided and valid
      if (!formData.password) {
        delete updateData.password;
      }
      delete updateData.confirmPassword;

      // Only include photo if it's a new file
      if (!(formData.photo instanceof File)) {
        delete updateData.photo;
      }

      const updatedWorker = await updateWorker(selectedWorker._id, updateData);

      setWorkers(prev =>
        prev.map(worker =>
          worker._id === selectedWorker._id ? {
            ...worker,
            ...updatedWorker,
            department: departments.find(dept => dept._id === (updatedWorker.department?._id || updatedWorker.department))?.name ||
              (typeof updatedWorker.department === 'object' ? updatedWorker.department.name : updatedWorker.department)
          } : worker
        )
      );

      // Generate QR Code if it was changed/updated (or just to keep it consistent as user observed)
      setIsEditModalOpen(false);
      toast.success('Employee updated successfully');
      loadData();
    } catch (error) {
      console.error('Update Error:', error);
      toast.error(error.message || 'Failed to update employee');
    }
  };
  // Handle delete worker
  const handleDeleteWorker = async () => {
    try {
      await deleteWorker(selectedWorker._id);
      setWorkers(prev => prev.filter(worker => worker._id !== selectedWorker._id));
      setIsDeleteModalOpen(false);
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };


  const DetailItem = ({ label, value, isBadge, badgeColor }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-1">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      {isBadge ? (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${badgeColor === 'red' ? 'bg-red-100 text-red-700 border border-red-200' :
          badgeColor === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
            badgeColor === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
              'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
          {value || 'N/A'}
        </span>
      ) : (
        <span className="text-sm font-semibold text-gray-800">{value || 'N/A'}</span>
      )}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(settings.localization?.locale || 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const getExpiryStatus = (dateString) => {
    if (!dateString) return { status: 'N/A', color: 'gray' };
    const expiry = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { color: 'red' };
    if (diffDays <= 30) return { color: 'amber' };
    return { color: 'green' };
  };

  return (
    <div className="bg-transparent">
      {/* HEADER */}
      <div className="page-header-row flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-semibold text-slate-900 mb-0">Employee</h1>
          {accountType === 'premium' ? (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[11px] font-semibold rounded-full">
              Pro
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[11px] font-semibold rounded-full">
              Free
            </span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={accountType === 'free' && workers.length >= 5 ? () => setShowPremiumUpgrade(true) : openAddModal}
          className="add-btn h-[44px] px-6 rounded-[12px] text-[14px] font-medium"
        >
          <FaPlus size={14} className="mr-2" /> Add Employee
        </Button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-6 space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search Name, ID..."
            className="w-full admin-search-input bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <select
            className="flex-shrink-0 bg-white border border-gray-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 relative"
            value={passTypeFilter}
            onChange={(e) => setPassTypeFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
          >
            <option value="">All Passes</option>
            <option value="Work Permit">Work Permit</option>
            <option value="S Pass">S Pass (X-pass)</option>
            <option value="E Pass">E Pass</option>
            <option value="TEP">TEP</option>
          </select>

          <select
            className="flex-shrink-0 bg-white border border-gray-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 relative"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
          >
            <option value="">All Expiry</option>
            <option value="Expired">Expired</option>
            <option value="Expiring">Expiring (30d)</option>
            <option value="Valid">Valid</option>
          </select>

          <select
            className="flex-shrink-0 bg-white border border-gray-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 relative"
            value={resignationFilter}
            onChange={(e) => setResignationFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
      </div>

      {/* Employee Count Indicator */}
      {/* Employee Count Indicator */}
      {accountType === 'free' && (
        <div className="mb-6 p-4 bg-white rounded-[16px] shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-normal text-slate-500">
              Free Plan Usage
            </span>
            <span className={`text-[12px] font-semibold ${workers.length >= 5 ? 'text-rose-500' : 'text-slate-900'}`}>
              {workers.length} / 5 Employees
            </span>
          </div>
          <div className="w-full bg-slate-50 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full transition-all ${workers.length >= 5 ? 'bg-rose-500' : 'bg-slate-900'}`}
              style={{ width: `${Math.min(100, (workers.length / 5) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* EMPLOYEE LIST */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
          {filteredWorkers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">No employees found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[12px] font-bold text-slate-700 bg-slate-50/50 uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Name</th>
                    <th className="py-4 px-6 font-semibold">Username</th>
                    <th className="py-4 px-6 font-semibold">Department</th>
                    <th className="py-4 px-6 font-semibold">RFID</th>
                    <th className="py-4 px-6 font-semibold">Face Enroll</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.map(worker => {
                    const isActive = !worker.resignationStatus || worker.resignationStatus === 'Active';
                    const statusBg = isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-600 border border-gray-200';
                    const statusDot = isActive ? 'bg-emerald-500' : 'bg-gray-400';
                    const faceCaptured = worker.faceEmbeddings && worker.faceEmbeddings.length > 0;

                    return (
                      <tr 
                        key={worker._id}
                        className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                        onClick={() => openViewModal(worker)}
                      >
                        {/* Name column */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img 
                                src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=f9fafb&color=0f172a`}
                                alt={worker.name}
                                className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-100"
                              />
                              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusDot}`}></div>
                            </div>
                            <div>
                              <span className="text-[14px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">{worker.name}</span>
                              <span className="text-[11px] font-normal text-slate-400 mt-0.5 block">ID: {worker.employeeId || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Username column */}
                        <td className="py-3.5 px-6 text-[13px] font-medium text-slate-600">
                          {worker.username || 'N/A'}
                        </td>

                        {/* Department column */}
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 text-xs font-semibold">
                            <FaBuilding className="text-slate-400 text-[10px]" />
                            {worker.department?.name || worker.department || 'No Department'}
                          </span>
                        </td>

                        {/* RFID column */}
                        <td className="py-3.5 px-6 text-[13px] font-medium text-slate-500 font-mono">
                          {worker.rfid || 'N/A'}
                        </td>

                        {/* Face Enroll column */}
                        <td className="py-3.5 px-6">
                          {faceCaptured ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Captured
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Not Captured
                            </span>
                          )}
                        </td>

                        {/* Status column */}
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBg}`}>
                            {worker.resignationStatus || 'Active'}
                          </span>
                        </td>

                        {/* Actions column */}
                        <td className="py-3.5 px-6 text-right pr-10" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(worker); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors" title="Edit">
                              <FaEdit size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openFaceCaptureModal(worker); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" title="Face Capture">
                              <FaCamera size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openDeleteModal(worker); }} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}



      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Employee"
        size="xl"
      >
        <form onSubmit={handleAddWorker} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employee ID (Optional)</label>
                <div className="flex">
                  <input
                    type="text"
                    name="employeeId"
                    className="form-input rounded-r-none"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Enter ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000) }))}
                    className="rounded-l-none"
                  >
                    Gen
                  </Button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">PIN Number</label>
                <input
                  type="password"
                  name="pinNumber"
                  className="form-input"
                  value={formData.pinNumber}
                  onChange={handleChange}
                  placeholder="Attendance PIN"
                  maxLength="6"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number (Optional)</label>
                <input
                  type="text"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 81234567"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Employment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-input"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resignation Status</label>
                <select
                  name="resignationStatus"
                  className="form-input"
                  value={formData.resignationStatus}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              {/* ─── Exit Workflow: shown only when Resigned ─── */}
              {formData.resignationStatus === 'Resigned' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Exit Reason Type</label>
                    <select
                      name="exitReasonType"
                      className="form-input"
                      value={formData.exitReasonType}
                      onChange={handleChange}
                    >
                      <option value="">Select Reason Type</option>
                      <option value="Company Termination">Company Termination</option>
                      <option value="Employee Resignation">Employee Resignation</option>
                    </select>
                  </div>

                  <div className="form-group md:col-span-3">
                    <label className="form-label">Exit Reason Description</label>
                    <textarea
                      name="exitReasonDescription"
                      className="form-input min-h-[80px]"
                      value={formData.exitReasonDescription}
                      onChange={handleChange}
                      placeholder="Describe the reason for exit in detail..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Exit</label>
                    <input
                      type="date"
                      name="dateOfExit"
                      className={`form-input`}
                      value={formData.dateOfExit}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch *</label>
                <select
                  name="batch"
                  className="form-input"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch, index) => (
                    <option key={batch._id || batch.batchName || index} value={batch.batchName}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salary *</label>
                <input
                  type="text"
                  name="salary"
                  className="form-input"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter monthly salary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unique RFID ID</label>
                <div className="flex">
                  <input
                    type="text"
                    name="rfid"
                    className="form-input rounded-r-none"
                    value={formData.rfid}
                    onChange={handleChange}
                    placeholder="Auto-generated"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getWorkerId}
                    className="rounded-l-none"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    id="photo-add"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <label
                    htmlFor="photo-add"
                    className="form-input flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  >
                    <span className="text-gray-500 truncate">
                      {formData.photo instanceof File
                        ? formData.photo.name
                        : (formData.photo ? 'Photo selected' : 'Choose photo...')}
                    </span>
                    <FaCamera className="text-gray-400" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Work Pass Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Work Pass Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Work Pass Type</label>
                <select
                  name="workPassType"
                  className="form-input"
                  value={formData.workPassType}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Work Permit">Work Permit</option>
                  <option value="S Pass">S Pass (X-pass)</option>
                  <option value="E Pass">E Pass</option>
                  <option value="TEP">TEP (Training Employment Pass)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  className="form-input"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  className="form-input"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indian, Bangladeshi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pass Expiry Date</label>
                <input
                  type="date"
                  name="passExpiryDate"
                  className="form-input"
                  value={formData.passExpiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Contact & Address</h3>
            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                className="form-input min-h-[100px]"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Singapore stay address"
              ></textarea>
            </div>
          </div>

          {/* Emergency Details */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Emergency Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Emergency Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-input"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Contact person name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Number</label>
                <input
                  type="text"
                  name="emergencyContactNumber"
                  className="form-input"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                  placeholder="Contact person number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  className="form-input"
                  value={formData.relationship}
                  onChange={handleChange}
                  placeholder="e.g. Spouse, Friend"
                />
              </div>
            </div>
          </div>

          {/* Bank & Additional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Bank Details</h3>
              <div className="form-group">
                <label className="form-label">Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  className="form-input"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Additional Details</h3>
              <div className="form-group">
                <label className="form-label">Qualification (Optional)</label>
                <input
                  type="text"
                  name="qualification"
                  className="form-input"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="Highest qualification"
                />
              </div>
            </div>
          </div>

          {/* ID Proof Upload */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111] flex items-center gap-2">
              ID Proof
              <span className="text-xs font-normal text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">Optional</span>
            </h3>
            <div className="form-group">
              <label className="form-label">Upload ID Document</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                <input
                  type="file"
                  id="idProof-add"
                  accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                  className="hidden"
                  onChange={handleIdProofUpload}
                />
                {!formData.idProofFile ? (
                  <label
                    htmlFor="idProof-add"
                    className="flex flex-col items-center justify-center py-4 cursor-pointer"
                  >
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">Click to upload ID proof</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, Excel — Max 5MB</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    {formData.idProofFile.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(formData.idProofFile)}
                        alt="ID Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    )}
                    {!formData.idProofFile.type.startsWith('image/') && (
                      <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-lg border border-blue-100">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{formData.idProofFile.name}</p>
                      <p className="text-xs text-gray-400">{(formData.idProofFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <label
                      htmlFor="idProof-add"
                      className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline flex-shrink-0"
                    >
                      Replace
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2 pb-6">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
        size="xl"
      >
        <form onSubmit={handleEditWorker} className="space-y-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employee ID (Optional)</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter ID"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Number</label>
                <input
                  type="password"
                  name="pinNumber"
                  className="form-input"
                  value={formData.pinNumber}
                  onChange={handleChange}
                  placeholder="Attendance PIN"
                  maxLength="6"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number (Optional)</label>
                <input
                  type="text"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email ID</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (optional)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    name="password"
                    className="form-input pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Employment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-input"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="resignationStatus"
                  className="form-input"
                  value={formData.resignationStatus}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              {/* ─── Exit Workflow: shown only when Resigned ─── */}
              {formData.resignationStatus === 'Resigned' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Exit Reason Type</label>
                    <select
                      name="exitReasonType"
                      className="form-input"
                      value={formData.exitReasonType}
                      onChange={handleChange}
                    >
                      <option value="">Select Reason Type</option>
                      <option value="Company Termination">Company Termination</option>
                      <option value="Employee Resignation">Employee Resignation</option>
                    </select>
                  </div>

                  <div className="form-group md:col-span-3">
                    <label className="form-label">Exit Reason Description</label>
                    <textarea
                      name="exitReasonDescription"
                      className="form-input min-h-[80px]"
                      value={formData.exitReasonDescription}
                      onChange={handleChange}
                      placeholder="Describe the reason for exit in detail..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Exit</label>
                    <input
                      type="date"
                      name="dateOfExit"
                      className={`form-input ${!formData.exitReasonType ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={formData.dateOfExit}
                      onChange={handleChange}
                      disabled={!formData.exitReasonType}
                    />
                    {!formData.exitReasonType && (
                      <p className="text-xs text-amber-600 mt-1">Select Exit Reason Type first</p>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch *</label>
                <select
                  name="batch"
                  className="form-input"
                  value={formData.batch}
                  onChange={handleChange}
                  required
                >
                   {batches.map((batch, index) => (
                    <option key={batch._id || batch.batchName || index} value={batch.batchName}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Salary *</label>
                <input
                  type="number"
                  name="salary"
                  className="form-input"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unique RFID ID</label>
                <input
                  type="text"
                  name="rfid"
                  className="form-input bg-gray-50"
                  value={formData.rfid}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    id="photo-edit"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <label
                    htmlFor="photo-edit"
                    className="form-input flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  >
                    <span className="text-gray-500 truncate">
                      {formData.photo instanceof File
                        ? formData.photo.name
                        : (formData.photo ? 'Current Photo' : 'Choose photo...')}
                    </span>
                    <FaCamera className="text-gray-400" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Work Pass Info */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Work Pass Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Work Pass Type</label>
                <select
                  name="workPassType"
                  className="form-input"
                  value={formData.workPassType}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Work Permit">Work Permit</option>
                  <option value="S Pass">S Pass (X-pass)</option>
                  <option value="E Pass">E Pass</option>
                  <option value="TEP">TEP (Training Employment Pass)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  className="form-input"
                  value={formData.passportNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  className="form-input"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pass Expiry Date</label>
                <input
                  type="date"
                  name="passExpiryDate"
                  className="form-input"
                  value={formData.passExpiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Contact & Address</h3>
            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                className="form-input min-h-[100px]"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* Emergency Details */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Emergency Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Emergency Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-input"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Number</label>
                <input
                  type="text"
                  name="emergencyContactNumber"
                  className="form-input"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  className="form-input"
                  value={formData.relationship}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Bank & Additional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Bank Details</h3>
              <div className="form-group">
                <label className="form-label">Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  className="form-input"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Additional Details</h3>
              <div className="form-group">
                <label className="form-label">Qualification (Optional)</label>
                <input
                  type="text"
                  name="qualification"
                  className="form-input"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Custom Leave Allocation */}
          {/* <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Custom Leave Allocation (Optional)</h3>
            <p className="text-xs text-gray-500 mb-4">Leave fields blank to use the global policy default limits.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {globalLeavePolicy.map((leave) => (
                <div key={leave.type} className="form-group">
                  <label className="form-label text-xs">{leave.label}</label>
                  <input
                    type="number"
                    name={leave.type}
                    className="form-input"
                    value={formData.leaveOverrides?.[leave.type] ?? ''}
                    onChange={handleLeaveOverrideChange}
                    min="0"
                    placeholder={leave.defaultDays !== undefined ? `Default: ${leave.defaultDays}` : "Auto"}
                  />
                </div>
              ))}
            </div>
          </div> */}

          {/* ID Proof Upload */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111] flex items-center gap-2">
              ID Proof
              <span className="text-xs font-normal text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">Optional — only upload to replace existing</span>
            </h3>
            <div className="form-group">
              {selectedWorker?.idProofUrl && !formData.idProofFile && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-green-700 font-medium flex-1">ID Proof already uploaded</span>
                  {selectedWorker?.idProofUrl && (
                    <button
                      type="button"
                      onClick={() => handleViewDocument(selectedWorker)}
                      className="text-xs text-blue-600 font-semibold hover:underline flex-shrink-0"
                    >
                      View Document
                    </button>
                  )}
                </div>
              )}
              <label className="form-label">{selectedWorker?.idProofUrl ? 'Replace ID Document' : 'Upload ID Document'}</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-gray-50">
                <input type="file" id="idProof-edit" accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx" className="hidden" onChange={handleIdProofUpload} />
                {!formData.idProofFile ? (
                  <label htmlFor="idProof-edit" className="flex flex-col items-center justify-center py-4 cursor-pointer">
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">Click to upload new ID proof</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG, Excel — Max 5MB</span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4">
                    {formData.idProofFile.type.startsWith('image/') && (
                      <img src={URL.createObjectURL(formData.idProofFile)} alt="ID Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    )}
                    {!formData.idProofFile.type.startsWith('image/') && (
                      <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-lg border border-blue-100">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{formData.idProofFile.name}</p>
                      <p className="text-xs text-gray-400">{(formData.idProofFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <label htmlFor="idProof-edit" className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline flex-shrink-0">Replace</label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2 pb-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Employee Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Profile Details"
        size="xl"
      >
        {selectedWorker && (
          <div className="space-y-8 pr-2">
            {/* Header Profile Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                <div className="relative flex-shrink-0 group">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-white border border-gray-200 transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={selectedWorker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedWorker.name)}&size=128&background=random&color=fff&bold=true`}
                      alt="Employee"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase shadow-lg border-2 border-white ${selectedWorker.resignationStatus === 'Resigned' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {selectedWorker.resignationStatus || 'Active'}
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedWorker.name}</h2>
                    <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-1">
                      {typeof selectedWorker.department === 'object' ? selectedWorker.department.name : selectedWorker.department} • {selectedWorker.batch}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Employee ID</p>
                      <p className="text-sm font-bold text-gray-800">{selectedWorker.employeeId || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Email Address</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{selectedWorker.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Phone Number</p>
                      <p className="text-sm font-bold text-gray-800">{selectedWorker.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal & Identification */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></span>
                    Identity & Personal
                  </h3>
                  <div className="space-y-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <DetailItem label="Full Name" value={selectedWorker.name} />
                    <DetailItem label="Employee ID" value={selectedWorker.employeeId} />
                    <DetailItem label="Gender" value={selectedWorker.gender} />
                    <DetailItem label="Date of Birth" value={formatDate(selectedWorker.dob)} />
                    <DetailItem label="Nationality" value={selectedWorker.nationality} />
                    <DetailItem label="Pass Type" value={selectedWorker.workPassType} isBadge badgeColor="gray" />
                    <DetailItem label="Passport No" value={selectedWorker.passportNumber} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-amber-600 rounded-full shadow-lg shadow-amber-200"></span>
                    Contact & Address
                  </h3>
                  <div className="space-y-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <DetailItem label="Primary Contact" value={selectedWorker.contactNumber} />
                    <DetailItem label="Email ID" value={selectedWorker.email} />
                    <div className="pt-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Address</p>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                        {selectedWorker.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment & Emergency */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200"></span>
                    Professional Info
                  </h3>
                  <div className="space-y-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <DetailItem label="Join Date" value={formatDate(selectedWorker.dateOfJoining)} />
                    <DetailItem label="Pass Expiry" value={formatDate(selectedWorker.passExpiryDate)} isBadge badgeColor={getExpiryStatus(selectedWorker.passExpiryDate).color} />
                    <DetailItem label="Department" value={typeof selectedWorker.department === 'object' ? selectedWorker.department.name : selectedWorker.department} />
                    <DetailItem label="Batch/Shift" value={selectedWorker.batch} />
                    <DetailItem label="Monthly Salary" value={formatCurrency(selectedWorker.salary, settings)} isBadge badgeColor="green" />
                    <DetailItem label="RFID Tag ID" value={selectedWorker.rfid} />
                    <DetailItem label="Qualification" value={selectedWorker.qualification} />
                    {selectedWorker.resignationStatus === 'Resigned' && (
                      <>
                        <DetailItem label="Exit Date" value={formatDate(selectedWorker.dateOfExit)} isBadge badgeColor="red" />
                        <DetailItem label="Exit Reason Type" value={selectedWorker.exitReasonType} isBadge badgeColor="red" />
                        {selectedWorker.exitReasonDescription && (
                          <div className="py-2 border-b border-gray-100">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Exit Description</span>
                            <p className="text-sm text-gray-700 bg-red-50/40 p-2 rounded-lg border border-red-50 italic leading-relaxed">
                              {selectedWorker.exitReasonDescription}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {/* ID Proof Viewer Trigger */}
                    {selectedWorker.idProofUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">ID Proof Document</span>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-[200px]" title={selectedWorker.idProofUrl.split('/').pop()}>
                                {selectedWorker.idProofUrl.split('/').pop()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleViewDocument(selectedWorker)}
                              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors shadow-sm flex-1 sm:flex-none w-full sm:w-auto"
                            >
                              <FaEye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <a
                              href={getFullFileUrl(selectedWorker.idProofUrl)}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-none w-full sm:w-auto"
                            >
                              <FaDownload className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-red-600 rounded-full shadow-lg shadow-red-200"></span>
                    Emergency & Finance
                  </h3>
                  <div className="grid grid-cols-1 gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="space-y-1 bg-red-50/30 p-3 rounded-xl border border-red-50">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter mb-2">Emergency Hub</p>
                      <DetailItem label="Contact Person" value={selectedWorker.emergencyContactName} />
                      <DetailItem label="Mobile" value={selectedWorker.emergencyContactNumber} />
                      <DetailItem label="Relationship" value={selectedWorker.relationship} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 pl-1">Financial Data</p>
                      <DetailItem label="Bank Account" value={selectedWorker.bankAccountNumber} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-10">
          <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="px-10 py-2.5 rounded-xl border-2 hover:bg-gray-50 transition-all font-bold tracking-wide uppercase text-xs">
            Done Viewing
          </Button>
        </div>
      </Modal>

      {/* Face Capture Modal */}
      <Modal
        isOpen={showFaceCapture}
        onClose={() => setShowFaceCapture(false)}
        title={selectedWorkerForFace ? `Capture Face for ${selectedWorkerForFace.name}` : "Capture Face"}
        size="lg"
      >
        <FaceCapture onFacesCaptured={handleFacesCaptured} />
      </Modal>

      {/* Delete Worker Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Employee"
      >
        <p className="mb-4">
          Are you sure you want to delete <strong>{selectedWorker?.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteWorker}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumUpgrade}
        onClose={() => setShowPremiumUpgrade(false)}
      />

      {/* Embedded Document Viewer Modal */}
      <DocumentViewerModal 
        isOpen={isDocumentViewerOpen} 
        onClose={() => setIsDocumentViewerOpen(false)} 
        document={activeDocument} 
        getFullFileUrl={getFullFileUrl}
      />

    </div>
  );
};

export default WorkerManagement;
