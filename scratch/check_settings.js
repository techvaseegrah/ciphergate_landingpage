const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const Settings = mongoose.model('Settings', new mongoose.Schema({ subdomain: String }, { strict: false }));
    
    const allSettings = await Settings.find({});
    console.log('Current Settings in DB:');
    allSettings.forEach(s => {
      console.log(`- ID: ${s._id}, Subdomain: ${s.subdomain}`);
    });
    
    const mainSettings = allSettings.filter(s => s.subdomain === 'main');
    if (mainSettings.length > 1) {
      console.log('🚨 WARNING: Multiple "main" subdomains found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
