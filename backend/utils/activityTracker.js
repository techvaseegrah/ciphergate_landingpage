const Admin = require('../models/Admin');
const Worker = require('../models/Worker');

const updateActivity = async (userId, role) => {
  if (!userId || userId === 'client_user') return;
  const Model = role === 'admin' ? Admin : Worker;
  const today = new Date().toISOString().split('T')[0];
  try {
    await Model.updateOne(
      { _id: userId },
      { 
        $set: { lastActive: new Date() },
        $addToSet: { loginDates: today }
      }
    );
  } catch (error) {
    console.error(`Error updating activity for ${role} ${userId}:`, error);
  }
};

module.exports = { updateActivity };
