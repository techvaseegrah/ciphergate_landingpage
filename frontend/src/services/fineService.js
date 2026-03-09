import api from './api';
import { getAuthToken } from '../utils/authUtils';

export const addFine = async (workerId, fineData) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`fines/add-fine/${workerId}`, fineData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to add fine');
  }
};

export const removeFine = async (workerId, fineId) => {
  try {
    const token = getAuthToken();
    const response = await api.post(`fines/remove-fine/${workerId}/${fineId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to remove fine');
  }
};

// ADD DELETE FINE FUNCTION
export const deleteFine = async (workerId, fineId) => {
  try {
    const token = getAuthToken();
    const response = await api.delete(`fines/delete-fine/${workerId}/${fineId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete fine');
  }
};

export const getWorkerFines = async (workerId) => {
  try {
    const token = getAuthToken();
    const response = await api.get(`fines/worker-fines/${workerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to get worker fines');
  }
};