import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAdmin, subdomainAvailable } from '../../services/authService';
import { motion } from 'framer-motion';
import { FaLink } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Spinner from '../../components/common/Spinner';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const TwoStepRegistration = () => {
  const [formData, setFormData] = useState({
    subdomain: '',
    mobileNo: '',
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google token raw response:", tokenResponse);

        let userInfo = {};
        if (tokenResponse.credential) {
          userInfo = jwtDecode(tokenResponse.credential);
        } else if (tokenResponse.access_token) {
          userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }).then(res => res.json());
        }

        if (userInfo.email) {
          setFormData(prev => ({
            ...prev,
            email: userInfo.email,
            username: userInfo.given_name || userInfo.name || ''
          }));
          toast.success("Details fetched from Google successfully. Please complete the remaining fields.");
        } else {
          throw new Error("No Email returned");
        }
      } catch (error) {
        console.error("Failed to extract Google user info", error);
        toast.error("Failed to fetch details from Google. Please enter manually.");
      }
    },
    onError: errorResponse => {
      console.error("Google login error", errorResponse);
      toast.error('Google sign-in failed. Please try again or enter details manually.');
    }
  });

  const formFieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { delay: custom * 0.1 }
    })
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Sanitize subdomain: lowercase and remove spaces
    if (name === 'subdomain') {
      value = value.toLowerCase().replace(/\s+/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'subdomain') {
      handleSubdomainChange({ target: { value } });
    }
  };

  // Use a ref to track the latest subdomain check to avoid race conditions
  const latestCheckRef = React.useRef(0);

  const handleSubdomainChange = async (e) => {
    const { value } = e.target;
    if (value.length < 3) {
      setDomainAvailable(false);
      return;
    }

    const checkId = ++latestCheckRef.current;

    // Simple debounce logic: wait 500ms before checking
    clearTimeout(window.subdomainTimeout);
    window.subdomainTimeout = setTimeout(async () => {
      try {
        const response = await subdomainAvailable({ subdomain: value });
        if (checkId === latestCheckRef.current) {
          setDomainAvailable(response.available);
        }
      } catch (error) {
        if (checkId === latestCheckRef.current) {
          console.error('Subdomain check error:', error);
          setDomainAvailable(false);
        }
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!domainAvailable) {
      toast.error('Please choose an available company name');
      return;
    }

    setIsLoading(true);

    try {
      const adminData = {
        username: formData.username,
        subdomain: formData.subdomain,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        businessType: 'Other',
        phoneNumber: formData.mobileNo,
        flatShopNo: '',
        street: '',
        pincode: '',
        city: '',
        district: '',
        state: '',
        country: 'India',
        website: '',
        gstNumber: ''
      };

      const response = await registerAdmin(adminData);
      toast.success(response.message || 'Registration successful! Your account has been created.');

      setTimeout(() => {
        navigate('/admin/login');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black overflow-hidden relative">
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
        <div className="mb-6 text-center">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-[#111111]"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create Admin Account
          </motion.h1>
          <motion.div
            className="h-1 bg-[#111111] rounded-full w-0 mx-auto mt-2"
            initial={{ width: 0 }}
            animate={{ width: "60px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full flex justify-center items-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111111] transition-colors"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </button>
        </motion.div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            className="form-group"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <label htmlFor="subdomain" className="text-black flex items-center text-sm font-medium mb-2">
              <FaLink className="h-4 w-4 mr-2 text-[#111111]" />
              Company Name
            </label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              className={`w-full px-4 py-3 bg-gray-100 border ${domainAvailable ? 'border-gray-300' : 'border-red-500'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black`}
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

          <motion.div
            className="form-group"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <label htmlFor="mobileNo" className="text-black flex items-center text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#111111]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Mobile No
            </label>
            <PhoneInput
              country={'in'}
              enableSearch={true}
              searchPlaceholder="Search country..."
              value={formData.mobileNo}
              onChange={(phone) => setFormData(prev => ({ ...prev, mobileNo: phone }))}
              inputProps={{
                name: 'mobileNo',
                required: true,
                className: "w-full pl-[50px] pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black"
              }}
              containerClass="w-full"
              buttonClass="!border-gray-300 !bg-gray-100 !rounded-l-lg"
            />
          </motion.div>

          <motion.div
            className="form-group"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <label htmlFor="username" className="text-black flex items-center text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#111111]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </motion.div>

          <motion.div
            className="form-group"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <label htmlFor="email" className="text-black flex items-center text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#111111]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div
            className="form-group relative"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <label htmlFor="password" className="text-black flex items-center text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#111111]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black pr-10"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#111111] focus:outline-none"
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

          <motion.div
            className="form-group relative"
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={6}
          >
            <label htmlFor="confirmPassword" className="text-black flex items-center text-sm font-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#111111]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent text-black pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#111111] focus:outline-none"
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

          <motion.button
            type="submit"
            disabled={isLoading || !domainAvailable}
            variants={formFieldVariants}
            initial="hidden"
            animate="visible"
            custom={7}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-[#111111] text-white rounded-lg hover:bg-[#000000] border-2 border-[#111111] transition-colors disabled:opacity-70 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Creating Account...
              </span>
            ) : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-[#111111]" fill="currentColor" viewBox="0 0 20 20">
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

        <motion.p
          className="mt-6 text-center text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Already have an account?{' '}
          <Link
            to="/admin/login"
            className="text-[#111111] hover:text-[#000000] font-medium transition-colors"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default TwoStepRegistration;