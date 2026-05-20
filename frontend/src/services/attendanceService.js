import api from './api';
import { getAuthToken } from '../utils/authUtils';
import { getCurrentPosition, isWorkerInAllowedLocation } from './geolocationService';

export const putAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        
        const response = await api.put('attendance', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

// RFID attendance function with location validation
export const putRfidAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        // First, get the worker to determine their subdomain
        const workerResponse = await api.post('workers/get-worker-by-rfid', { rfid: attendanceData.rfid }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const worker = workerResponse.data.worker;
        const subdomain = worker.subdomain;

        const attendanceRequest = { ...attendanceData, latitude: 0, longitude: 0 };

        const response = await api.post('attendance/rfid', attendanceRequest, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        // Return the response data directly
        return response.data;
    } catch (error) {
        console.error('Failed to mark RFID attendance:', error);
        throw error.response?.data || new Error('Failed to mark RFID attendance');
    }
};

// New function for face recognition attendance
export const recognizeFaceAndMarkAttendance = async (faceDescriptor, subdomain) => {
    const token = getAuthToken();
    try {
        const response = await api.post('attendance/face-recognition', { faceDescriptor, subdomain }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to recognize face and mark attendance:', error);
        throw error.response?.data || new Error('Failed to recognize face');
    }
};

export const getAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        const response = await api.post('attendance', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

export const getWorkerAttendance = async (attendanceData) => {
    const token = getAuthToken();

    try {
        const response = await api.post('attendance/worker', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to update attendance:', error);
        throw error.response?.data || new Error('Failed to update attendance');
    }
};

// Function to get worker's last attendance record
export const getWorkerLastAttendance = async (rfid, subdomain) => {
    const token = getAuthToken();

    try {
        const response = await api.post('attendance/worker-last', { rfid, subdomain }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get worker last attendance:', error);
        throw error.response?.data || new Error('Failed to get worker last attendance');
    }
};

let paginatedController = null;

export const getPaginatedAttendance = async (attendanceData) => {
    if (paginatedController) paginatedController.abort();
    paginatedController = new AbortController();
    
    const token = getAuthToken();

    try {
        const response = await api.post('attendance/paginated', attendanceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: paginatedController.signal
        });
        return response.data;
    } catch (error) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') return { attendance: [], hasMore: false };
        console.error('Failed to fetch paginated attendance:', error);
        throw error.response?.data || new Error('Failed to fetch paginated attendance');
    }
};

export default {
    putAttendance,
    putRfidAttendance,
    getAttendance,
    getWorkerAttendance,
    recognizeFaceAndMarkAttendance,
    getWorkerLastAttendance
};