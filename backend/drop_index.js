const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    
    const db = mongoose.connection.db;
    const collection = db.collection('workers'); // Usually the collection name is lowercase plural

    console.log('Attempting to drop index: employeeId_1');
    try {
      await collection.dropIndex('employeeId_1');
      console.log('Successfully dropped index employeeId_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('Index employeeId_1 not found (already dropped?)');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

dropIndex();
