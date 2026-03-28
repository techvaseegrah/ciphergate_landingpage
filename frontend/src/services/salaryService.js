import api from './api';
import { getAuthToken } from '../utils/authUtils';

export const giveBonusAmount = async (salaryData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`salary/give-bonus/${salaryData.id}`, {
      amount: salaryData.amount,
      fromDate: salaryData.fromDate,
      toDate: salaryData.toDate,
      reason: salaryData.reason || ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to give bonus');
  }
};

export const removeBonusAmount = async (workerId) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`salary/remove-bonus/${workerId}`, {}, {
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
    const response = await api.post(`salary/reset-salary`, { subdomain: salaryData.subdomain }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to reset salary');
  }
};

export const getSalaryReport = async (workerId, fromDate, toDate) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`salary/report/${workerId}`, {
      params: { fromDate, toDate },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to get salary report');
  }
};

export const addDeduction = async (workerId, deductionData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`salary/add-deduction/${workerId}`, deductionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add deduction');
  }
};

export const deleteDeduction = async (workerId, deductionId) => {
  try {
    const token = getAuthToken();
    const response = await api.delete(`salary/deduction/${workerId}/${deductionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete deduction');
  }
};

export const giveIncrement = async (workerId, incrementData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`salary/increment/${workerId}`, incrementData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to give increment');
  }
};

export const getDepartmentSalarySummary = async (subdomain, fromDate, toDate) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`salary/department-summary/${subdomain}`, {
      params: { fromDate, toDate },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to get department salary summary');
  }
};