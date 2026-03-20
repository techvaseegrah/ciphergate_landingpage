import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Added useLocation import
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import { getWorkers, createWorker, updateWorker, deleteWorker, getUniqueId } from '../../services/workerService';
import { getDepartments } from '../../services/departmentService';
import { getSettings } from '../../services/settingsService';
import { getCurrentUser } from '../../services/authService';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';
import QRCode from 'qrcode';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import FaceCapture from './FaceCapture'; // Import FaceCapture component
import PremiumUpgradeModal from '../common/PremiumUpgradeModal'; // Import the premium upgrade modal

const WorkerManagement = () => {
  const location = useLocation(); // Added useLocation hook
  const nameInputRef = useRef(null);
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]); // <-- This line was missing
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
  const [selectedWorker, setSelectedWorker] = useState(null);

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
    workPassType: '',
    passportNumber: '',
    nationality: '',
    passExpiryDate: '',
    address: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
    relationship: '',
    bankAccountNumber: '',
    qualification: ''
  });

  // Subdomain
  const { subdomain } = useContext(appContext);

  // Load workers, departments and user account info
  const loadData = async () => {
    setIsLoading(true);
    setIsLoadingDepartments(true);

    try {
      const [workersData, departmentsData, settingsData, userData] = await Promise.all([
        getWorkers({ subdomain }),
        getDepartments({ subdomain }),
        getSettings({ subdomain }),
        getCurrentUser() // Get current user data
      ]);

      const safeWorkersData = Array.isArray(workersData) ? workersData : [];
      const safeDepartmentsData = Array.isArray(departmentsData) ? departmentsData : [];
      const safeSettingsData = settingsData || {};

      setWorkers(safeWorkersData);
      setDepartments(safeDepartmentsData);
      setBatches(safeSettingsData.batches || []);

      // Set account type and current user
      setAccountType(userData?.accountType || 'free');
      setCurrentUser(userData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
      setWorkers([]);
      setDepartments([]);
      setBatches([]);
      setAccountType('free');
      setCurrentUser(null);
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
      workPassType: '',
      passportNumber: '',
      nationality: '',
      passExpiryDate: '',
      address: '',
      emergencyContactNumber: '',
      emergencyContactName: '',
      relationship: '',
      bankAccountNumber: '',
      qualification: ''
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
      rfid: worker.rfid || ''
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

  const generateQRCode = async (username, uniqueId) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(uniqueId, { width: 300 });
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${username}_${uniqueId}.png`;
      link.click();
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedSalary = String(formData.salary).trim();

    // Validation checks
    if (!subdomain || subdomain == 'main') {
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

    if (!formData.employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    if (!formData.contactNumber) {
      toast.error('Contact Number is required');
      return;
    }

    if (!formData.workPassType) {
      toast.error('Work Pass Type is required');
      return;
    }

    if (!formData.dateOfJoining) {
      toast.error('Date of Joining is required');
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

      generateQRCode(trimmedUsername, formData.rfid);
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
    if (!formData.name || !formData.username || !formData.employeeId || !formData.contactNumber || !formData.workPassType || !formData.dateOfJoining || !formData.department) {
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
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
    }

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
      generateQRCode(updatedWorker.username || formData.username, updatedWorker.rfid || formData.rfid);

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

  // Table columns configuration
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (record) => (
        <div className="flex items-center">
          {record?.photo && (
            <img
              src={record.photo
                ? record.photo
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}`}
              alt="Employee"
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{record.name}</span>
            <span className="text-xs text-gray-500">{record.employeeId || 'No ID'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contactNumber',
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-sm">{record.contactNumber || 'N/A'}</span>
          <span className="text-xs text-gray-400">{record.email || ''}</span>
        </div>
      )
    },
    {
      header: 'Work Pass',
      accessor: 'workPassType',
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.workPassType || 'N/A'}</span>
          <span className="text-[10px] text-gray-400">{record.passportNumber || ''}</span>
        </div>
      )
    },
    {
      header: 'Pass Expiry',
      accessor: 'passExpiryDate',
      render: (record) => {
        if (!record.passExpiryDate) return <span className="text-gray-400">N/A</span>;

        const expiry = new Date(record.passExpiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let colorClass = 'text-gray-600';
        let bgClass = 'bg-gray-100';

        if (diffDays < 0) {
          colorClass = 'text-red-700';
          bgClass = 'bg-red-100 border border-red-200';
        } else if (diffDays <= 30) {
          colorClass = 'text-amber-700';
          bgClass = 'bg-amber-100 border border-amber-200';
        }

        return (
          <div className="flex flex-col">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${bgClass} ${colorClass}`}>
              {expiry.toLocaleDateString()}
            </span>
            {diffDays < 0 && <span className="text-[10px] text-red-600 mt-0.5 font-bold uppercase">Expired</span>}
            {diffDays >= 0 && diffDays <= 30 && <span className="text-[10px] text-amber-600 mt-0.5">Expires in {diffDays}d</span>}
          </div>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-sm">
            {typeof record.department === 'object'
              ? record.department.name
              : (departments.find(dept => dept._id === record.department)?.name || record.department || 'N/A')}
          </span>
          <span className="text-[10px] text-gray-400">{record.batch || ''}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'resignationStatus',
      render: (record) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${record.resignationStatus === 'Resigned' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
          {record.resignationStatus || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (record) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openViewModal(record)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => openEditModal(record)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Employee"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => openDeleteModal(record)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Employee"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => openFaceCaptureModal(record)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Face Capture"
          >
            <FaCamera />
          </button>
        </div>
      ),
    },
  ];

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
      return new Date(dateString).toLocaleDateString('en-GB', {
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
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Employee Management</h1>
          {accountType === 'premium' ? (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full shadow-sm">
              PREMIUM PLAN
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              FREE PLAN
            </span>
          )}
        </div>
        <Button
          variant={accountType === 'free' && workers.length >= 5 ? "danger" : "primary"}
          onClick={accountType === 'free' && workers.length >= 5 ? () => setShowPremiumUpgrade(true) : openAddModal}
          className={accountType === 'free' && workers.length >= 5 ? "opacity-90 hover:opacity-100" : ""}
        >
          <FaPlus className="mr-2 inline" />
          {accountType === 'free' && workers.length >= 5 ? 'Limit Reached - Upgrade' : 'Add Employee'}
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Name, ID..."
                className="form-input w-full md:w-64 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pass:</span>
              <select
                className="form-input text-sm py-1.5 h-auto min-w-[120px]"
                value={passTypeFilter}
                onChange={(e) => setPassTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Work Permit">Work Permit</option>
                <option value="S Pass">S Pass (X-pass)</option>
                <option value="E Pass">E Pass</option>
                <option value="TEP">TEP</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry:</span>
              <select
                className="form-input text-sm py-1.5 h-auto min-w-[120px]"
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
              >
                <option value="">All Expiry</option>
                <option value="Expired">Expired</option>
                <option value="Expiring">Expiring (30d)</option>
                <option value="Valid">Valid</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status:</span>
              <select
                className="form-input text-sm py-1.5 h-auto min-w-[120px]"
                value={resignationFilter}
                onChange={(e) => setResignationFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee Count Indicator */}
        {accountType === 'free' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[#111111] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-700 font-medium">
                  Free Account: {workers.length}/5 employees used
                </span>
              </div>
              {workers.length >= 5 && (
                <span className="text-sm text-red-600 font-medium">
                  Limit Reached
                </span>
              )}
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full"
                style={{ width: `${Math.min(100, (workers.length / 5) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredWorkers}
            isLoading={isLoading}
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Employee"
        size="xl"
      >
        <form onSubmit={handleAddWorker} className="space-y-8">
          {/* Basic Info */}
          <section>
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
                <label className="form-label">Employee ID *</label>
                <div className="flex">
                  <input
                    type="text"
                    name="employeeId"
                    className="form-input rounded-r-none"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Enter ID"
                    required
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
                <label className="form-label">Contact Number *</label>
                <input
                  type="text"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 81234567"
                  required
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
          </section>

          {/* Employment Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Employment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Date of Joining *</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-input"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
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

              <div className="form-group">
                <label className="form-label">Date of Exit (Optional)</label>
                <input
                  type="date"
                  name="dateOfExit"
                  className="form-input"
                  value={formData.dateOfExit}
                  onChange={handleChange}
                />
              </div>

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
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch.batchName}>
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
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </section>

          {/* Work Pass Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Work Pass Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Work Pass Type *</label>
                <select
                  name="workPassType"
                  className="form-input"
                  value={formData.workPassType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Work Permit">Work Permit</option>
                  <option value="S Pass">S Pass (X-pass)</option>
                  <option value="E Pass">E Pass</option>
                  <option value="TEP">TEP (Training Employment Pass)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number {formData.workPassType ? '*' : ''}</label>
                <input
                  type="text"
                  name="passportNumber"
                  className="form-input"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                  required={!!formData.workPassType}
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
          </section>

          {/* Contact & Address */}
          <section>
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
          </section>

          {/* Emergency Details */}
          <section>
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
          </section>

          {/* Bank & Additional */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </section>

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
          <section>
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
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-input"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter ID"
                  required
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
                <label className="form-label">Contact Number *</label>
                <input
                  type="text"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
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
          </section>

          {/* Employment Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Employment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Date of Joining *</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  className="form-input"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
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

              <div className="form-group">
                <label className="form-label">Date of Exit</label>
                <input
                  type="date"
                  name="dateOfExit"
                  className="form-input"
                  value={formData.dateOfExit}
                  onChange={handleChange}
                />
              </div>

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
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch.batchName}>
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
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>
          </section>

          {/* Work Pass Info */}
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-[#111111]">Work Pass Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Work Pass Type *</label>
                <select
                  name="workPassType"
                  className="form-input"
                  value={formData.workPassType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Work Permit">Work Permit</option>
                  <option value="S Pass">S Pass (X-pass)</option>
                  <option value="E Pass">E Pass</option>
                  <option value="TEP">TEP (Training Employment Pass)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number {formData.workPassType ? '*' : ''}</label>
                <input
                  type="text"
                  name="passportNumber"
                  className="form-input"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  required={!!formData.workPassType}
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
          </section>

          {/* Contact & Address */}
          <section>
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
          </section>

          {/* Emergency Details */}
          <section>
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
          </section>

          {/* Bank & Additional */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </section>

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
                <section>
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
                </section>

                <section>
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
                </section>
              </div>

              {/* Employment & Emergency */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full shadow-lg shadow-emerald-200"></span>
                    Professional Info
                  </h3>
                  <div className="space-y-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <DetailItem label="Join Date" value={formatDate(selectedWorker.dateOfJoining)} />
                    <DetailItem label="Pass Expiry" value={formatDate(selectedWorker.passExpiryDate)} isBadge badgeColor={getExpiryStatus(selectedWorker.passExpiryDate).color} />
                    <DetailItem label="Department" value={typeof selectedWorker.department === 'object' ? selectedWorker.department.name : selectedWorker.department} />
                    <DetailItem label="Batch/Shift" value={selectedWorker.batch} />
                    <DetailItem label="Monthly Salary" value={`₹${selectedWorker.salary?.toLocaleString()}`} isBadge badgeColor="green" />
                    <DetailItem label="RFID Tag ID" value={selectedWorker.rfid} />
                    <DetailItem label="Qualification" value={selectedWorker.qualification} />
                    {selectedWorker.resignationStatus === 'Resigned' && (
                      <DetailItem label="Exit Date" value={formatDate(selectedWorker.dateOfExit)} isBadge badgeColor="red" />
                    )}
                  </div>
                </section>

                <section>
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
                </section>
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
    </div>
  );
};

export default WorkerManagement;