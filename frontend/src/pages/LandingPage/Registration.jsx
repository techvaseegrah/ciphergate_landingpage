import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '../../services/authService';
import { toast } from 'react-toastify';
import Spinner from '../../components/common/Spinner';

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', districtState: '', phoneNumber: '',
    shopName: '', flatShopNo: '', street: '', city: '', country: '', businessType: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const isStep1Valid = () => formData.fullName && formData.email && formData.phoneNumber.length === 10;
  const isStep2Valid = () => formData.shopName && formData.businessType;
  const isStep3Valid = () => password && confirmPassword && password === confirmPassword;

  const handleSubmit = async () => {
    if (!isStep3Valid()) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Use shopName as the subdomain and username as the fullName
      const adminData = {
        username: formData.fullName,
        email: formData.email,
        password: password,
        confirmPassword: confirmPassword,
        subdomain: formData.shopName.toLowerCase().replace(/\s+/g, '-'), // Convert shop name to subdomain format
        businessType: formData.businessType,
        phoneNumber: formData.phoneNumber
      };

      const response = await registerAdmin(adminData);
      toast.success(response.message || 'Registration successful! Your account has been created.');
      
      // Redirect to login after successful registration
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
    <div className="fixed inset-0 bg-dark-navy/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-dark-navy font-poppins">Get Started with <span className="text-primary-green">CipherGate</span></h3>
            <button onClick={() => navigate('/')} className="p-2 hover:bg-soft-green rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="mb-10 flex items-center gap-4">
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-green' : 'bg-gray-100'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-green' : 'bg-gray-100'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step === 3 ? 'bg-primary-green' : 'bg-gray-100'}`} />
          </div>
          
          <form className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <input name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="Company Name" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none">
                  <option value="">Business Type</option>
                  <option value="Retail">Retail</option>
                  <option value="Service">Service</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password" 
                    className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" 
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm your password" 
                    className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" 
                    minLength="6"
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <p>By completing registration, you agree to store your business details securely.</p>
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 font-bold text-gray-text hover:text-dark-navy transition-colors">Back</button>
              )}
              <button 
                type="button"
                onClick={() => {
                  if (step === 1 && isStep1Valid()) {
                    setStep(2);
                  } else if (step === 2 && isStep2Valid()) {
                    setStep(3);
                  } else if (step === 3) {
                    handleSubmit();
                  }
                }}
                disabled={
                  (step === 1 && !isStep1Valid()) || 
                  (step === 2 && !isStep2Valid()) || 
                  (step === 3 && !isStep3Valid()) || 
                  isLoading
                }
                className="flex-[2] py-4 bg-primary-green text-white rounded-full font-bold shadow-lg shadow-green-100 hover:bg-primary-hover disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Creating Account...
                  </span>
                ) : (
                  step === 3 ? 'Complete Registration' : 'Next Step'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Registration;