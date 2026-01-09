const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Test the paginated attendance function
async function testPaginatedAttendance() {
  try {
    const subdomain = 'testcompany'; // Replace with an actual subdomain from your database
    const page = 1;
    const limit = 2;

    // Get all unique dates for the subdomain
    const allDates = await Attendance.distinct('date', { subdomain });
    console.log('All dates count:', allDates.length);

    // Sort dates manually (newest first)
    const sortedDates = allDates.sort((a, b) => new Date(b) - new Date(a));
    console.log('Sorted dates:', sortedDates.slice(0, 5)); // Show first 5 dates

    // Get the dates for the current page
    const skip = (page - 1) * limit;
    const datesForPage = sortedDates.slice(skip, skip + limit);
    console.log('Dates for page:', datesForPage);

    // Get all attendance records for the dates on this page
    const attendanceData = await Attendance.find({ 
      subdomain, 
      date: { $in: datesForPage } 
    }).sort({ date: -1, createdAt: -1 });
    
    console.log('Attendance data count:', attendanceData.length);
    if (attendanceData.length > 0) {
      console.log('Sample attendance record date:', attendanceData[0].date);
    }

    // Check if there are more records available
    const hasMore = skip + limit < sortedDates.length;
    console.log('Has more:', hasMore);

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPaginatedAttendance();