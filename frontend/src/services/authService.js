import api from './api';
import { getAuthToken } from '../utils/authUtils';

export const subdomainAvailable = async (formData) => {
  try {
    const response = await api.post('/auth/admin/subdomain-available', formData);
    return response.data;
  } catch (error) {
    console.error("Subdomain not available", error);
    throw error.response?.data || new Error('Failed to check subdomain availability');
  }
};

export const registerAdmin = async (userData) => {
  try {
    const response = await api.post('/auth/admin/register', userData);
    const responseData = response.data;

    // Store the token and user data in localStorage after registration
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('tasktracker-subdomain', responseData.subdomain);
    localStorage.setItem('user', JSON.stringify({
      _id: responseData._id,
      username: responseData.username,
      subdomain: responseData.subdomain,
      email: responseData.email,
      role: responseData.role,
      name: responseData.username, // Use username as name for now
      accountType: responseData.accountType,
      businessType: responseData.businessType,
      phoneNumber: responseData.phoneNumber,
      flatShopNo: responseData.flatShopNo,
      street: responseData.street,
      pincode: responseData.pincode,
      city: responseData.city,
      district: responseData.district,
      state: responseData.state,
      country: responseData.country,
      website: responseData.website,
      gstNumber: responseData.gstNumber
    }));

    return responseData;
  } catch (error) {
    throw error.response?.data || new Error('Failed to register admin');
  }
};

export const login = async (credentials, userType) => {
  try {
    const response = await api.post(`/auth/${userType}`, credentials);
    const userData = response.data;

    // Include department and salary information when saving to localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('tasktracker-subdomain', userData.subdomain);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      subdomain: userData.subdomain,
      rfid: userData.rfid,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      department: userData.department,
      accountType: userData.accountType, // Add account type
      businessType: userData.businessType, // Add business type
      phoneNumber: userData.phoneNumber, // Add phone number
      flatShopNo: userData.flatShopNo, // Add business details
      street: userData.street,
      pincode: userData.pincode,
      city: userData.city,
      district: userData.district,
      state: userData.state,
      country: userData.country,
      website: userData.website,
      gstNumber: userData.gstNumber,
      // Add these two lines to save salary information
      salary: userData.salary,
      finalSalary: userData.finalSalary
    }));

    return userData;
  } catch (error) {
    // Provide more specific error messages based on the error response
    if (error.response?.status === 401) {
      if (userType === 'worker') {
        throw new Error('Invalid employee credentials. Please check your username and password.');
      } else {
        throw new Error('Invalid admin credentials. Please check your username and password.');
      }
    }
    throw error.response?.data || new Error('Login failed. Please try again.');
  }
};

export const googleLoginAdmin = async (tokenData) => {
  try {
    const response = await api.post('/auth/admin/google', tokenData);
    const userData = response.data;

    // Store the token and user data in localStorage
    localStorage.setItem('token', userData.token);
    localStorage.setItem('tasktracker-subdomain', userData.subdomain);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      subdomain: userData.subdomain,
      rfid: userData.rfid,
      email: userData.email,
      role: userData.role,
      name: userData.username,
      department: userData.department,
      accountType: userData.accountType,
      businessType: userData.businessType,
      phoneNumber: userData.phoneNumber,
      flatShopNo: userData.flatShopNo,
      street: userData.street,
      pincode: userData.pincode,
      city: userData.city,
      district: userData.district,
      state: userData.state,
      country: userData.country,
      website: userData.website,
      gstNumber: userData.gstNumber,
      salary: userData.salary,
      finalSalary: userData.finalSalary
    }));

    return userData;
  } catch (error) {
    throw error.response?.data || new Error(error.message || 'Google Login failed. Please try again.');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      const user = JSON.parse(userJson);
      return {
        ...user,
        token
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// Corrected initialization check
export const checkAndInitAdmin = async () => {
  try {
    const response = await api.get('/auth/check-admin');
    return response.data;
  } catch (error) {
    console.error('Admin check failed:', error);
    throw error;
  }
};

// New functions for password reset functionality with OTP
export const requestPasswordResetOtp = async (data) => {
  try {
    const response = await api.post('/auth/request-reset-otp', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to request password reset OTP.');
  }
};

export const resetPasswordWithOtp = async (data) => {
  try {
    const response = await api.put('/auth/reset-password-with-otp', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to reset password.');
  }
};

// New function to get all admin accounts
export const getAllAdmins = async () => {
  try {
    const response = await api.get('/auth/admins');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch admin accounts.');
  }
};

// New function to update an admin account
export const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/auth/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to update admin account.');
  }
};

// New function to delete an admin account
export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/auth/admins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to delete admin account.');
  }
};

// New function to login client
export const loginClient = async (credentials) => {
  try {
    console.log('DEBUG: Calling client login API with endpoint: /auth/client/login');
    const response = await api.post('/auth/client/login', credentials);
    console.log('DEBUG: Client login response:', response.data);
    const userData = response.data;

    // Store the token and user data in localStorage after client login
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify({
      _id: userData._id,
      username: userData.username,
      role: userData.role
    }));

    return userData;
  } catch (error) {
    console.error('DEBUG: Client login error details:', error);
    console.error('DEBUG: Error response:', error.response);
    console.error('DEBUG: Error config:', error.config);
    console.error('DEBUG: Error message:', error.message);
    throw error.response?.data || new Error('Client login failed. Please check your credentials.');
  }
};

// New function to get admin by ID
export const getAdminById = async (id) => {
  try {
    const response = await api.get(`/auth/admins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch admin account details.');
  }
};

export default {
  registerAdmin,
  login,
  logout,
  getCurrentUser,
  checkAndInitAdmin,
  subdomainAvailable,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  loginClient,
  getAdminById,
  googleLoginAdmin
};