import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', email: '', districtState: '', phoneNumber: '',
    shopName: '', flatShopNo: '', street: '', city: '', country: '', businessType: ''
  });

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

  return (
    <div className="fixed inset-0 bg-dark-navy/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <motion.div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-dark-navy font-poppins">Get Started with <span className="text-primary-green">Travigo</span></h3>
            <button onClick={() => navigate('/')} className="p-2 hover:bg-soft-green rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="mb-10 flex items-center gap-4">
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-green' : 'bg-gray-100'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step === 2 ? 'bg-primary-green' : 'bg-gray-100'}`} />
          </div>
          
          <form className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
              </div>
            ) : (
              <div className="space-y-4">
                <input name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="Preferred Destination / Shop Name" className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none" />
                <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-6 py-4 bg-light-gray rounded-2xl border-none focus:ring-2 focus:ring-primary-green outline-none">
                  <option value="">Interest Type</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Business">Business Travel</option>
                </select>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-text hover:text-dark-navy transition-colors">Back</button>
              )}
              <button 
                type="button"
                onClick={() => step === 1 ? setStep(2) : navigate('/')}
                disabled={step === 1 && !isStep1Valid()}
                className="flex-[2] py-4 bg-primary-green text-white rounded-full font-bold shadow-lg shadow-green-100 hover:bg-primary-hover disabled:opacity-50 transition-all"
              >
                {step === 1 ? 'Next Step' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Registration;