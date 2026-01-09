import api from './api';
import { getAuthToken } from '../utils/authUtils';

export const giveBonusAmount = async (salaryData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/salary/give-bonus/${salaryData.id}`, {
      amount: salaryData.amount,
      fromDate: salaryData.fromDate,
      toDate: salaryData.toDate
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};

export const removeBonusAmount = async (workerId) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/salary/remove-bonus/${workerId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to remove bonus');
  }
};

export const resetSalaryAmount = async (salaryData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`/salary/reset-salary`, {subdomain: salaryData.subdomain}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update leave status');
  }
};

export const getSalaryReport = async (workerId, fromDate, toDate) => { // ADD THIS
  try {
    const token = getAuthToken();
    const response = await api.get(`/salary/report/${workerId}`, {
      params: { fromDate, toDate },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to get salary report');
  }
};