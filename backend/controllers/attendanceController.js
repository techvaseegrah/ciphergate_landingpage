const mongoose = require('mongoose');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const Department = require('../models/Department');

// @desc    Update or create attendance record for a worker
// @route   PUT /api/attendance
// @access  Private
const putAttendance = async (req, res) => {
    try {
        const { rfid, subdomain, presence: providedPresence } = req.body;
        
        console.log('putAttendance called with:', { rfid, subdomain, providedPresence });

        // Check recent punch (within 1 minute)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentAttendance = await Attendance.findOne({
            rfid,
            subdomain,
            createdAt: { $gte: oneMinuteAgo }
        }).sort({ createdAt: -1 });

        if (recentAttendance) {
            const nextAction = recentAttendance.presence ? 'punch out' : 'punch in';
            return res.status(200).json({ 
                success: false, 
                message: `Try ${nextAction} after 1 minute` 
            });
        }

        // Find worker
        const worker = await Worker.findOne({ subdomain, rfid });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Find department
        let department;
        if (worker.department && mongoose.Types.ObjectId.isValid(worker.department)) {
            department = await Department.findById(worker.department);
        }
        if (!department) {
            department = await Department.findOne({ subdomain, name: worker.department });
        }
        if (!department) {
            return res.status(404).json({ message: 'Department not found for worker' });
        }

        // IST Formatting
        const indiaTimezoneDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const indiaTimezoneTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const currentDateFormatted = indiaTimezoneDate.format(new Date());
        const currentTimeFormatted = indiaTimezoneTime.format(new Date());

        // Determine presence
        let newPresence;
        if (typeof providedPresence === 'boolean') {
            newPresence = providedPresence;
        } else {
            const lastAttendance = await Attendance.findOne({ rfid, subdomain }).sort({ createdAt: -1 });
            newPresence = lastAttendance ? !lastAttendance.presence : true;
        }

        const newAttendanceData = {
            name: worker.name,
            username: worker.username,
            rfid,
            subdomain,
            department: department._id,
            departmentName: department.name,
            photo: worker.photo || '',
            date: currentDateFormatted,
            time: currentTimeFormatted,
            presence: newPresence,
            worker: worker._id,
            createdAt: new Date()
        };

        const newAttendance = await Attendance.create(newAttendanceData);

        return res.status(201).json({
            message: newPresence ? 'Attendance marked as in' : 'Attendance marked as out',
            attendance: newAttendance
        });
    } catch (error) {
        console.error('putAttendance error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc   Update or create attendance record for a worker using RFID
// @route   PUT /api/attendance/rfid
// @access  Private
const putRfidAttendance = async (req, res) => {
    try {
        const { rfid, presence: providedPresence } = req.body;

        console.log('putRfidAttendance called with:', { rfid, providedPresence });

        // Find worker first to get their subdomain
        const worker = await Worker.findOne({ rfid });
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found for this RFID' });
        }

        const subdomain = worker.subdomain;

        // Check recent punch (within 1 minute)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentAttendance = await Attendance.findOne({
            rfid,
            createdAt: { $gte: oneMinuteAgo }
        }).sort({ createdAt: -1 });

        if (recentAttendance) {
            const nextAction = recentAttendance.presence ? 'punch out' : 'punch in';
            return res.status(200).json({ 
                success: false, 
                message: `Try ${nextAction} after 1 minute` 
            });
        }

        // Find department
        let department;
        if (worker.department && mongoose.Types.ObjectId.isValid(worker.department)) {
            department = await Department.findById(worker.department);
        }
        if (!department) {
            return res.status(404).json({ message: 'Department not found for worker' });
        }

        // IST Formatting
        const indiaTimezoneDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const indiaTimezoneTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const currentDateFormatted = indiaTimezoneDate.format(new Date());
        const currentTimeFormatted = indiaTimezoneTime.format(new Date());

        // Determine presence
        let presence;
        if (typeof providedPresence === 'boolean') {
            presence = providedPresence;
        } else {
            const lastAttendance = await Attendance.findOne({ rfid }).sort({ createdAt: -1 });
            presence = lastAttendance ? !lastAttendance.presence : true;
        }

        const newAttendanceData = {
            name: worker.name,
            username: worker.username,
            rfid,
            subdomain,
            department: department._id,
            departmentName: department.name,
            photo: worker.photo || '',
            date: currentDateFormatted,
            time: currentTimeFormatted,
            presence: presence,
            worker: worker._id,
            createdAt: new Date()
        };

        const newAttendance = await Attendance.create(newAttendanceData);

        return res.status(201).json({
            message: presence ? 'Attendance marked as in' : 'Attendance marked as out',
            attendance: newAttendance
        });
    } catch (error) {
        console.error('putRfidAttendance error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Retrieve all attendance records for a specific subdomain
// @route   POST /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const { subdomain } = req.body;

        if (!subdomain) {
            return res.status(401).json({ message: 'Company name is missing, login again' });
        }

        const attendanceData = await Attendance.find({ subdomain }).populate('worker').populate('department');

        return res.status(200).json({ message: 'Attendance data retrieved successfully', attendance: attendanceData });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Retrieve attendance records for a specific subdomain with pagination
// @route   POST /api/attendance/paginated
// @access  Private
const getPaginatedAttendance = async (req, res) => {
    try {
        const { subdomain, page = 1, limit = 2 } = req.body;

        if (!subdomain) {
            return res.status(401).json({ message: 'Company name is missing, login again' });
        }

        const skip = (page - 1) * limit;
        let attendanceData = [];
        let hasMore = false;
        let totalPages = 1;

        const allDates = await Attendance.distinct('date', { subdomain });
        const sortedDates = allDates.sort((a, b) => new Date(b) - new Date(a));
        const datesForPage = sortedDates.slice(skip, skip + limit);
        
        if (datesForPage.length > 0) {
            attendanceData = await Attendance.find({ 
                subdomain, 
                date: { $in: datesForPage } 
            }).sort({ date: -1, createdAt: -1 });
        }
        
        hasMore = skip + limit < sortedDates.length;
        totalPages = Math.ceil(sortedDates.length / limit);

        return res.status(200).json({ 
            message: 'Attendance data retrieved successfully', 
            attendance: attendanceData,
            hasMore,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Retrieve attendance records for a specific worker by RFID and subdomain
// @route   POST /api/attendance/worker
// @access  Private
const getWorkerAttendance = async (req, res) => {
    try {
        const { rfid, subdomain } = req.body;

        if (!subdomain) {
            return res.status(401).json({ message: 'Company name is missing, login again' });
        }

        const workerAttendance = await Attendance.find({ rfid, subdomain });

        return res.status(200).json({ message: 'Worker attendance data retrieved successfully', attendance: workerAttendance });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get worker's last attendance record
// @route   POST /api/attendance/worker-last
// @access  Private
const getWorkerLastAttendance = async (req, res) => {
    try {
        const { rfid, subdomain } = req.body;

        if (!subdomain) {
            return res.status(401).json({ message: 'Company name is missing, login again' });
        }

        const lastAttendance = await Attendance.findOne({ rfid, subdomain }).sort({ createdAt: -1 });
        
        if (!lastAttendance) {
            return res.status(200).json({
                presence: true,
                message: 'No previous records found'
            });
        }

        const nextPresence = !lastAttendance.presence;
        return res.status(200).json({
            presence: nextPresence,
            lastAttendance: lastAttendance,
            message: nextPresence ? 'Next: Punch In' : 'Next: Punch Out'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Recognize face and mark attendance
// @route   POST /api/attendance/face-recognition
// @access  Private
const recognizeFaceAndMarkAttendance = async (req, res) => {
    try {
        const { faceDescriptor, subdomain } = req.body;

        const workers = await Worker.find({ 
            subdomain, 
            faceEmbeddings: { $exists: true, $ne: [] } 
        });

        if (!workers.length) {
            return res.status(404).json({ message: 'No workers with face data found' });
        }

        let bestMatch = null;
        let minDistance = Infinity;

        for (const worker of workers) {
            for (const embedding of worker.faceEmbeddings) {
                const distance = calculateEuclideanDistance(faceDescriptor, embedding);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = worker;
                }
            }
        }

        const threshold = 0.4;
        if (!bestMatch || minDistance > threshold) {
            return res.status(404).json({ message: 'No matching worker found' });
        }

        const department = await Department.findById(bestMatch.department);
        if (!department) {
            return res.status(404).json({ message: 'Department not found for worker' });
        }

        const indiaTimezoneDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const indiaTimezoneTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        const currentDateFormatted = indiaTimezoneDate.format(new Date());
        const currentTimeFormatted = indiaTimezoneTime.format(new Date());

        const lastAttendance = await Attendance.findOne({ rfid: bestMatch.rfid, subdomain }).sort({ createdAt: -1 });
        const presence = lastAttendance ? !lastAttendance.presence : true;

        const newAttendance = await Attendance.create({
            name: bestMatch.name,
            username: bestMatch.username,
            rfid: bestMatch.rfid,
            subdomain,
            department: department._id,
            departmentName: department.name,
            photo: bestMatch.photo,
            date: currentDateFormatted,
            time: currentTimeFormatted,
            presence,
            worker: bestMatch._id
        });

        return res.status(201).json({
            message: presence ? 'Attendance marked as in' : 'Attendance marked as out',
            attendance: newAttendance,
            worker: {
                _id: bestMatch._id,
                name: bestMatch.name,
                rfid: bestMatch.rfid,
                photo: bestMatch.photo
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function calculateEuclideanDistance(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return Infinity;
    }
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

module.exports = {
    putAttendance,
    putRfidAttendance,
    getAttendance,
    getPaginatedAttendance,
    getWorkerAttendance,
    getWorkerLastAttendance,
    recognizeFaceAndMarkAttendance
};