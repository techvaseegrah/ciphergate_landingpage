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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Account not found</p>
          <Link to="/client/management" className="text-[#111111] hover:underline mt-4 inline-block">
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
          <Link to="/client/management" className="text-[#111111] hover:underline mb-4 inline-block">
            ← Back to Management
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Account Details</h1>
          <p className="text-gray-600">View details for {account.username}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="max-w-xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Account Details</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-gray-900">{account.subdomain}</p>
                </div>

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
                  <label className="text-sm font-medium text-gray-500">Account Plan</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                      ${account.accountType === 'premium' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {account.accountType === 'premium' ? `Premium (${account.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'})` : 'Free Plan'}
                    </span>
                  </div>
                </div>

                {account.accountType === 'premium' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Billing Cycle</label>
                      <p className="text-gray-900 capitalize">{account.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">From Date</label>
                        <p className="text-gray-900">
                          {new Date(account.subscriptionStartDate || account.updatedAt || account.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Due Date</label>
                        <p className="text-gray-900">
                          {account.subscriptionEndDate
                            ? new Date(account.subscriptionEndDate).toLocaleDateString('en-GB')
                            : (() => {
                              const d = new Date(account.subscriptionStartDate || account.updatedAt || account.createdAt);
                              if (account.subscriptionPlan === 'yearly') d.setFullYear(d.getFullYear() + 1);
                              else d.setMonth(d.getMonth() + 1);
                              return d.toLocaleDateString('en-GB');
                            })()}
                        </p>
                      </div>
                    </div>
                  </>
                )}

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
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors"
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