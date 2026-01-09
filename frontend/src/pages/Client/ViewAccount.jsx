import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAdminById } from '../../services/authService';

const ViewAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const response = await getAdminById(id);
      setAccount(response);
    } catch (error) {
      toast.error('Failed to fetch account details');
      navigate('/client/management');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Account not found</p>
          <Link to="/client/management" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/client/management" className="text-blue-500 hover:underline mb-4 inline-block">
            ← Back to Management
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Account Details</h1>
          <p className="text-gray-600">View details for {account.username}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Details</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-gray-900">{account.subdomain}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Flat / Shop No</label>
                  <p className="text-gray-900">{account.flatShopNo || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Street</label>
                  <p className="text-gray-900">{account.street || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">City</label>
                    <p className="text-gray-900">{account.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">District</label>
                    <p className="text-gray-900">{account.district || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">State</label>
                    <p className="text-gray-900">{account.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-gray-900">{account.country || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Pincode</label>
                  <p className="text-gray-900">{account.pincode || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-gray-900">{account.phoneNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-gray-900">{account.website || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p className="text-gray-900">{account.gstNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Account Details</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{account.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{account.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900">{account.phoneNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                    ${account.accountType === 'premium' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {account.accountType}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-gray-900">
                    {new Date(account.createdAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Type</label>
                  <p className="text-gray-900">{account.businessType || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Link
              to="/client/management"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Management
            </Link>
            <Link
              to={`/client/edit/${account._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAccount;