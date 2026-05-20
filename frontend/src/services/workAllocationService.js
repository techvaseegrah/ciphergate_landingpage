import api from './api';

export const getTasks = async () => {
  try {
    const response = await api.get('work-allocation');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch tasks');
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('work-allocation', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to create task');
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`work-allocation/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to update task');
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`work-allocation/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to delete task');
  }
};

export const getOverview = async () => {
  try {
    const response = await api.get('work-allocation/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch allocation overview');
  }
};
