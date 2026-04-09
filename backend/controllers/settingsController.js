const Settings = require('../models/Settings');

// Helper to migrate legacy leave policy to array format
const migrateLeavePolicy = async (subdomain) => {
  const dbSettings = await Settings.collection.findOne({ subdomain });
  if (!dbSettings || !dbSettings.leavePolicy) return;

  if (!Array.isArray(dbSettings.leavePolicy)) {
    const old = dbSettings.leavePolicy;
    const newPolicy = [
      { type: 'annual', label: 'Annual Leave', defaultDays: old.annual ?? 7, overrides: [] },
      { type: 'sick', label: 'Sick Leave', defaultDays: old.sick ?? 14, overrides: [] },
      { type: 'hospital', label: 'Hospitalization Leave', defaultDays: old.hospital ?? 60, overrides: [] },
      { type: 'urgent', label: 'Urgent Leave', defaultDays: old.urgent ?? 3, overrides: [] },
      { type: 'marriage', label: 'Marriage Leave', defaultDays: old.marriage ?? 3, overrides: [] },
      { type: 'paternity', label: 'Paternity Leave', defaultDays: old.paternity ?? 3, overrides: [] },
      { type: 'compassion', label: 'Compassionate Leave', defaultDays: old.compassion ?? 3, overrides: [] },
      { type: 'personal', label: 'Personal Leave', defaultDays: old.personal ?? 3, overrides: [] },
      { type: 'unpaid', label: 'Unpaid Leave', defaultDays: old.unpaid ?? 0, overrides: [] },
      { type: 'homeCountry', label: 'Home Country Leave', defaultDays: old.homeCountry ?? 0, overrides: [] }
    ];
    await Settings.collection.updateOne({ _id: dbSettings._id }, { $set: { leavePolicy: newPolicy } });
    console.log(`Migrated legacy object leave policy for subdomain: ${subdomain}`);
  } else {
    // Array format exists, check if we need to migrate scope to overrides
    const hasOldScopeSchema = dbSettings.leavePolicy.some(p => p.scope !== undefined || p.assignedEmployees !== undefined);
    if (hasOldScopeSchema) {
      const newPolicy = dbSettings.leavePolicy.map(p => {
        const migratedPolicy = { ...p };
        if (!migratedPolicy.overrides) migratedPolicy.overrides = [];
        
        if (migratedPolicy.scope === 'specific' && Array.isArray(migratedPolicy.assignedEmployees) && migratedPolicy.assignedEmployees.length > 0) {
          migratedPolicy.overrides.push({
            employeeIds: migratedPolicy.assignedEmployees,
            days: migratedPolicy.defaultDays
          });
          // Set to 0 because under the old schema, specific meant NO global default days for others.
          migratedPolicy.defaultDays = 0;
        }
        delete migratedPolicy.scope;
        delete migratedPolicy.assignedEmployees;
        return migratedPolicy;
      });
      await Settings.collection.updateOne({ _id: dbSettings._id }, { $set: { leavePolicy: newPolicy } });
      console.log(`Migrated array leave policy (scope->overrides) for subdomain: ${subdomain}`);
    }
  }
};

// @desc    Get settings
// @route   GET /api/settings/:subdomain
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    await migrateLeavePolicy(req.params.subdomain);
    let settings = await Settings.findOne({ subdomain: req.params.subdomain });
    
    // If settings don't exist, create default settings
    if (!settings) {
      // Use req.user._id if available, otherwise create without it
      const settingsData = {
        subdomain: req.params.subdomain
      };
      
      // Only add updatedBy if req.user exists and has an _id
      if (req.user && req.user._id) {
        settingsData.updatedBy = req.user._id;
      }
      
      settings = await Settings.create(settingsData);
      console.log(`Created default settings for subdomain: ${req.params.subdomain}`);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get settings for public access (location validation)
// @route   GET /api/settings/public/:subdomain
// @access  Public
const getSettingsPublic = async (req, res) => {
  try {
    await migrateLeavePolicy(req.params.subdomain);
    let settings = await Settings.findOne({ subdomain: req.params.subdomain });
    
    // If settings don't exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        subdomain: req.params.subdomain
      });
      console.log(`Created default public settings for subdomain: ${req.params.subdomain}`);
    }
    
    // Only return location settings for public access
    const publicSettings = {
      attendanceLocation: settings.attendanceLocation
    };
    
    res.json(publicSettings);
  } catch (error) {
    console.error('Error in getSettingsPublic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update meal settings
// @route   PUT /api/settings/:subdomain/:mealType
// @access  Private/Admin
const updateMealSettings = async (req, res) => {
  try {
    const { subdomain, mealType } = req.params;
    const updateData = req.body;

    await migrateLeavePolicy(subdomain);
    let settings = await Settings.findOne({ subdomain });
    
    // If settings don't exist, create them
    if (!settings) {
      // Use req.user._id if available, otherwise create without it
      const settingsData = {
        subdomain: subdomain
      };
      
      // Only add updatedBy if req.user exists and has an _id
      if (req.user && req.user._id) {
        settingsData.updatedBy = req.user._id;
      }
      
      settings = await Settings.create(settingsData);
      console.log(`Created settings for subdomain: ${subdomain}`);
    }

    // Update the specific meal settings
    settings[mealType] = {
      ...settings[mealType],
      ...updateData
    };

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error in updateMealSettings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update general settings
// @route   PUT /api/settings/:subdomain
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const updateData = req.body;

    await migrateLeavePolicy(subdomain);
    let settings = await Settings.findOne({ subdomain });
    
    // If settings don't exist, create them
    if (!settings) {
      // Use req.user._id if available, otherwise create without it
      const settingsData = {
        subdomain: subdomain
      };
      
      // Only add updatedBy if req.user exists and has an _id
      if (req.user && req.user._id) {
        settingsData.updatedBy = req.user._id;
      }
      
      settings = await Settings.create(settingsData);
      console.log(`Created settings for subdomain: ${subdomain}`);
    }

    // Validate location settings if provided
    if (updateData.attendanceLocation) {
      const { latitude, longitude, radius } = updateData.attendanceLocation;
      
      // Validate latitude
      if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
        return res.status(400).json({ 
          message: 'Latitude must be between -90 and 90 degrees' 
        });
      }
      
      // Validate longitude
      if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
        return res.status(400).json({ 
          message: 'Longitude must be between -180 and 180 degrees' 
        });
      }
      
      // Validate radius
      if (radius !== undefined && (radius < 10 || radius > 1000)) {
        return res.status(400).json({ 
          message: 'Radius must be between 10 and 1000 meters' 
        });
      }
    }

    // Remove the locking logic to allow changes anytime
    // Simply allow all location updates without restrictions

    // Use findOneAndUpdate to properly handle nested objects
    // Prepare update object
    const updateObject = { ...updateData };
    
    // Remove protected fields
    delete updateObject.subdomain;
    delete updateObject._id;
    
    // Add metadata
    updateObject.lastUpdated = Date.now();
    if (req.user && req.user._id) {
      updateObject.updatedBy = req.user._id;
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { subdomain },
      { $set: updateObject },
      { new: true, runValidators: true }
    );

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  getSettingsPublic,
  updateMealSettings,
  updateSettings
};