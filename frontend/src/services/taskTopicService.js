import api from './api';

const API_URL = 'task-topics';

export const getTaskTopics = async (subdomain) => {
  try {
    const response = await api.get(API_URL, { params: { subdomain } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const createTaskTopic = async (topicData) => {
  try {
    const response = await api.post(API_URL, topicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const updateTaskTopic = async (id, topicData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, topicData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};

export const deleteTaskTopic = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network Error' };
  }
};
