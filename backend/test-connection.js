const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Not defined');
    
    if (!process.env.MONGO_URI) {
      console.log('MONGO_URI is not set in environment variables');
      process.exit(1);
    }
    
    // Attempt to connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
  }
};

testConnection();