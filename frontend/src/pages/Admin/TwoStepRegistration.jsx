import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAdmin } from '../../services/authService';
import { subdomainAvailable } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLink } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';

const TwoStepRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Details
    subdomain: '', // Company Name
    mobileNo: '',
    flatShopNo: '',
    street: '',
    pincode: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    website: '',
    gstNumber: '',
    // Step 2: Personal Details
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState(true);
  const navigate = useNavigate();

  // Form field animation variants
  const formFieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom * 0.1 }
    })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check subdomain availability when subdomain field changes
    if (name === 'subdomain') {
      // Use setTimeout to ensure state is updated before checking availability
      setTimeout(() => {
        handleSubdomainChange({ target: { value } });
      }, 0);
    }
  };

  const handleSubdomainChange = async (e) => {
    const { value } = e.target;
    
    // Basic validation
    if (value.length < 3) {
      setDomainAvailable(false);
      return;
    }

    try {
      const response = await subdomainAvailable({ subdomain: value });
      setDomainAvailable(response.available);
    } catch (error) {
      console.error('Subdomain check error:', error);
      setDomainAvailable(false);
    }
  };

  const handleNext = () => {
    // Validate Step 1 fields
    if (currentStep === 1) {
      if (!formData.subdomain || !formData.mobileNo || !formData.flatShopNo || !formData.street || !formData.pincode || !formData.city || !formData.district || !formData.state || !formData.country) {
        toast.error('Please fill in all required business details');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate subdomain
    if (!domainAvailable) {
      toast.error('Please choose an available company name');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare admin data with proper field mapping for backend
      const adminData = {
        username: formData.username,
        subdomain: formData.subdomain,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        businessType: 'Other', // Default value, can be enhanced later
        phoneNumber: formData.mobileNo, // Map mobileNo to phoneNumber
        flatShopNo: formData.flatShopNo,
        street: formData.street,
        pincode: formData.pincode,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        website: formData.website,
        gstNumber: formData.gstNumber
      };
      
      const response = await registerAdmin(adminData);
      toast.success(response.message || 'Registration successful! Your account has been created.');
      
      // After successful registration, redirect to admin login page
      setTimeout(() => {
        navigate('/admin/login');
      }, 1500); // Wait 1.5 seconds before redirecting to login page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gray-200/10"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100 - 20}%`],
              opacity: [0.3, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[85%] max-w-md z-10 bg-white backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-200 mx-auto my-10"
      >
        {/* Register Title with Animated Underline */}
        <div className="mb-6 text-center">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-[#0d9488]"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentStep === 1 ? 'Step 1: Business Details' : 'Step 2: Create Admin Account'}
          </motion.h1>
          <motion.div
            className="h-1 bg-[#0d9488] rounded-full w-0 mx-auto mt-2"
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#0d9488] text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-[#0d9488]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#0d9488] text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>
        </div>

        <form onSubmit={currentStep === 2 ? handleSubmit : undefined} className="space-y-4">
          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Company Name Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  <label htmlFor="subdomain" className="text-black flex items-center text-sm font-medium mb-2">
                    <FaLink className="h-4 w-4 mr-2 text-[#0d9488]" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    className={`w-full px-4 py-3 bg-gray-100 border ${domainAvailable ? 'border-gray-300' : 'border-red-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black`}
                    value={formData.subdomain}
                    onChange={handleChange}
                    required
                    placeholder="Enter your company name"
                  />
                  {!domainAvailable && (
                    <p className="text-red-500 text-xs mt-1">
                      This company name is not available or too short
                    </p>
                  )}
                </motion.div>

                {/* Mobile No Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  <label htmlFor="mobileNo" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Mobile No
                  </label>
                  <input
                    type="text"
                    id="mobileNo"
                    name="mobileNo"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                  />
                </motion.div>

                {/* Flat/Shop No and Street Fields on same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                  >
                    <label htmlFor="flatShopNo" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Flat/Shop No
                    </label>
                    <input
                      type="text"
                      id="flatShopNo"
                      name="flatShopNo"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.flatShopNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter flat/shop number"
                    />
                  </motion.div>

                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                  >
                    <label htmlFor="street" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Street
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      placeholder="Enter street name"
                    />
                  </motion.div>
                </div>

                {/* Pincode Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                >
                  <label htmlFor="pincode" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="Enter pincode"
                  />
                </motion.div>

                {/* City and District Fields on same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={6}
                  >
                    <label htmlFor="city" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter city"
                    />
                  </motion.div>

                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={7}
                  >
                    <label htmlFor="district" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      District
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      placeholder="Enter district"
                    />
                  </motion.div>
                </div>

                {/* State and Country Fields on same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={8}
                  >
                    <label htmlFor="state" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="Enter state"
                    />
                  </motion.div>

                  <motion.div 
                    className="form-group"
                    variants={formFieldVariants}
                    initial="hidden"
                    animate="visible"
                    custom={9}
                  >
                    <label htmlFor="country" className="text-black flex items-center text-sm font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="Enter country"
                    />
                  </motion.div>
                </div>

                {/* Website Field (Optional) */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={10}
                >
                  <label htmlFor="website" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                  />
                </motion.div>

                {/* GST Number Field (Optional) */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={11}
                >
                  <label htmlFor="gstNumber" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </motion.div>

                {/* Next Button */}
                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={12}
                >
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-[#0d9488] text-white rounded-lg hover:bg-[#0f766e] border-2 border-[#0d9488] transition-colors font-medium"
                  >
                    Next
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Username Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  <label htmlFor="username" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                  />
                </motion.div>

                {/* Pre-filled Company Name Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  <label htmlFor="subdomain" className="text-black flex items-center text-sm font-medium mb-2">
                    <FaLink className="h-4 w-4 mr-2 text-[#0d9488]" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.subdomain}
                    readOnly
                    placeholder="Company name (pre-filled)"
                  />
                </motion.div>

                {/* Mobile No Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                >
                  <label htmlFor="mobileNo" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Mobile No
                  </label>
                  <input
                    type="text"
                    id="mobileNo"
                    name="mobileNo"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.mobileNo}
                    readOnly
                    placeholder="Mobile number (pre-filled)"
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div 
                  className="form-group"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                >
                  <label htmlFor="email" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="form-group relative"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                >
                  <label htmlFor="password" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black pr-10"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#0d9488] focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div 
                  className="form-group relative"
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={6}
                >
                  <label htmlFor="confirmPassword" className="text-black flex items-center text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0d9488]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-transparent text-black pr-10"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#0d9488] focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.99 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Submit and Previous Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    type="button"
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-1/2 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 border-2 border-gray-300 transition-colors font-medium"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !domainAvailable}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-1/2 py-3 bg-[#0d9488] text-white rounded-lg hover:bg-[#0f766e] border-2 border-[#0d9488] transition-colors disabled:opacity-70 font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Spinner size="sm" className="mr-2" />
                        Creating Account...
                      </span>
                    ) : 'Create Account'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Account Limit Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Free Account Limit:</span> Your account includes up to 5 employees. 
                Upgrade anytime for unlimited employees and premium features.
              </p>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <motion.p
          className="mt-6 text-center text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Already have an account?{' '}
          <Link
            to="/admin/login"
            className="text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default TwoStepRegistration;