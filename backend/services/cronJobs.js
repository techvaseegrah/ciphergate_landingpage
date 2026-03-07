// backend/services/cronJobs.js
const cron = require('node-cron');
const Settings = require('../models/Settings');
const Admin = require('../models/Admin');

// Function to reset daily flags at midnight
const resetDailyFlags = async () => {
  try {
    await Settings.updateMany(
      { emailSentToday: true },
      {
        $set: {
          emailSentToday: false,
          lastEmailSent: null
        }
      }
    );

    console.log('Daily email flags reset successfully');
  } catch (error) {
    console.error('Error resetting daily flags:', error);
  }
};

// Function to expire subscriptions that have passed their end date
const expireSubscriptions = async () => {
  try {
    const now = new Date();
    const result = await Admin.updateMany(
      {
        accountType: 'premium',
        subscriptionEndDate: { $lt: now }
      },
      {
        $set: {
          accountType: 'free',
          accountStatus: 'paused',
          subscriptionPlan: 'none',
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          autoRenew: false
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Subscription expiry: ${result.modifiedCount} account(s) paused.`);
    }
  } catch (error) {
    console.error('Error expiring subscriptions:', error);
  }
};

// Start cron jobs
const startCronJobs = () => {
  console.log('Starting cron jobs for food request reports...');

  // Reset daily flags at midnight
  cron.schedule('0 0 * * *', resetDailyFlags, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Expire subscriptions daily at midnight
  cron.schedule('0 0 * * *', expireSubscriptions, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Cron jobs started successfully');
};

module.exports = {
  startCronJobs,
  resetDailyFlags,
  expireSubscriptions
};