import React, { useState, useEffect, useContext, Fragment } from 'react';
import { toast } from 'react-toastify';
import {
    FiClock, FiSettings, FiSave, FiRefreshCw, FiAlertTriangle, 
    FiDollarSign, FiUser, FiToggleLeft, FiPlus, FiTrash2, FiMapPin, FiGlobe
} from 'react-icons/fi';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import appContext from '../../context/AppContext';
import api from '../../services/api';
import { getAuthToken } from '../../utils/authUtils';
import { formatCurrency } from '../../utils/formatUtils';


const countryCurrencyMap = {
    India: { currency: "INR", symbol: "₹", locale: "en-IN" },
    USA: { currency: "USD", symbol: "$", locale: "en-US" },
    Singapore: { currency: "SGD", symbol: "S$", locale: "en-SG" },
    Russia: { currency: "RUB", symbol: "₽", locale: "ru-RU" },
    China: { currency: "CNY", symbol: "¥", locale: "zh-CN" }
};

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null); // Add this state to track current location
    const [workers, setWorkers] = useState([]); // Added for specific leave assignment
    const [overrideSearch, setOverrideSearch] = useState({});

    const { subdomain, refreshSettings } = useContext(appContext);

    // Original settings (for comparison)
    const [originalSettings, setOriginalSettings] = useState({});

    // Current form data
    const [settings, setSettings] = useState({


        // Attendance and productivity settings
        considerOvertime: false,
        deductSalary: true,
        permissionTimeMinutes: 15,
        salaryDeductionPerBreak: 10,
        deductLateMinutes: true,

        // Localization settings
        localization: {
            country: 'USA',
            currency: 'USD',
            currencySymbol: '$',
            locale: 'en-US'
        },

        // Batches and intervals
        batches: [
            {
                batchName: 'Full Time',
                from: '09:00',
                to: '19:00',
                lunchFrom: '12:00',
                lunchTo: '13:00',
                isLunchConsider: false
            }
        ],
        intervals: [
            {
                intervalName: 'interval1',
                from: '10:15',
                to: '10:30',
                isBreakConsider: false
            },
            {
                intervalName: 'interval2',
                from: '14:15',
                to: '14:30',
                isBreakConsider: false
            }
        ],

        // Location settings
        attendanceLocation: {
            enabled: false,
            latitude: 0,
            longitude: 0,
            radius: 100
        },

        // Leave Settings
        leaveEligibilityValue: 3,
        leaveEligibilityUnit: 'months',
        leavePolicy: [
            { type: 'annual', label: 'Annual Leave', defaultDays: 7, scope: 'all', assignedEmployees: [] },
            { type: 'sick', label: 'Sick Leave', defaultDays: 14, scope: 'all', assignedEmployees: [] },
            { type: 'hospital', label: 'Hospitalization Leave', defaultDays: 60, scope: 'all', assignedEmployees: [] },
            { type: 'urgent', label: 'Urgent Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
            { type: 'marriage', label: 'Marriage Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
            { type: 'paternity', label: 'Paternity Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
            { type: 'compassion', label: 'Compassionate Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
            { type: 'personal', label: 'Personal Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
            { type: 'unpaid', label: 'Unpaid Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] },
            { type: 'homeCountry', label: 'Home Country Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] }
        ]
    });

    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${period}`;
    };

    // Validation functions
    const validateBatchNames = (batches) => {
        const names = batches.map(batch => batch.batchName.trim().toLowerCase());
        const uniqueNames = new Set(names);
        return names.length === uniqueNames.size;
    };

    const validateIntervalNames = (intervals) => {
        const names = intervals.map(interval => interval.intervalName.trim().toLowerCase());
        const uniqueNames = new Set(names);
        return names.length === uniqueNames.size;
    };

    // Check if settings have changed
    const checkForChanges = (currentSettings) => {
        const changed = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
        setHasChanges(changed);
    };

    // Fetch settings from API
    const fetchSettings = async () => {
        if (!subdomain || subdomain === 'main') {
            toast.error('Invalid subdomain. Please check the URL.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token = getAuthToken();

            // Try fetching workers early to reduce waterfall
            if (subdomain !== 'main') {
                api.post('workers/all', { subdomain })
                    .then(res => setWorkers(res.data || []))
                    .catch(err => console.error("Error fetching workers", err));
            }

            const response = await api.get(`/settings/${subdomain}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const fetchedSettings = response.data;
            // Update state with fetched settings
            setSettings((prevSettings) => ({
                ...prevSettings,


                // Attendance and productivity settings
                considerOvertime: fetchedSettings.considerOvertime !== undefined ? fetchedSettings.considerOvertime : false,
                deductSalary: fetchedSettings.deductSalary !== undefined ? fetchedSettings.deductSalary : true,
                permissionTimeMinutes: fetchedSettings.permissionTimeMinutes || 15,
                salaryDeductionPerBreak: fetchedSettings.salaryDeductionPerBreak || 10,
                deductLateMinutes: fetchedSettings.deductLateMinutes !== undefined ? fetchedSettings.deductLateMinutes : true,

                // Batches and intervals
                batches: fetchedSettings.batches || [{
                    batchName: 'Full Time',
                    from: '09:00',
                    to: '19:00',
                    lunchFrom: '12:00',
                    lunchTo: '13:00',
                    isLunchConsider: false
                }],
                intervals: fetchedSettings.intervals || [
                    { intervalName: 'interval1', from: '10:15', to: '10:30', isBreakConsider: false },
                    { intervalName: 'interval2', from: '14:15', to: '14:30', isBreakConsider: false }
                ],

                // Location settings
                attendanceLocation: {
                    enabled: fetchedSettings.attendanceLocation?.enabled !== undefined ? fetchedSettings.attendanceLocation.enabled : false,
                    latitude: fetchedSettings.attendanceLocation?.latitude || 0,
                    longitude: fetchedSettings.attendanceLocation?.longitude || 0,
                    radius: fetchedSettings.attendanceLocation?.radius || 100
                },

                // Leave Settings
                leaveEligibilityValue: fetchedSettings.leaveEligibilityValue !== undefined ? fetchedSettings.leaveEligibilityValue : 3,
                leaveEligibilityUnit: fetchedSettings.leaveEligibilityUnit || 'months',
                leavePolicy: fetchedSettings.leavePolicy || [
                    { type: 'annual', label: 'Annual Leave', defaultDays: 7, scope: 'all', assignedEmployees: [] },
                    { type: 'sick', label: 'Sick Leave', defaultDays: 14, scope: 'all', assignedEmployees: [] },
                    { type: 'hospital', label: 'Hospitalization Leave', defaultDays: 60, scope: 'all', assignedEmployees: [] },
                    { type: 'urgent', label: 'Urgent Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'marriage', label: 'Marriage Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'paternity', label: 'Paternity Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'compassion', label: 'Compassionate Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'personal', label: 'Personal Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'unpaid', label: 'Unpaid Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] },
                    { type: 'homeCountry', label: 'Home Country Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] }
                ],

                // Localization settings
                localization: fetchedSettings.localization || {
                    country: 'India',
                    currency: 'INR',
                    currencySymbol: '₹',
                    locale: 'en-IN'
                }
            }));

            setOriginalSettings({
                ...fetchedSettings,
                batches: fetchedSettings.batches || [{
                    batchName: 'Full Time',
                    from: '09:00',
                    to: '19:00',
                    lunchFrom: '12:00',
                    lunchTo: '13:00',
                    isLunchConsider: false
                }],
                intervals: fetchedSettings.intervals || [
                    { intervalName: 'interval1', from: '10:15', to: '10:30', isBreakConsider: false },
                    { intervalName: 'interval2', from: '14:15', to: '14:30', isBreakConsider: false }
                ],
                attendanceLocation: {
                    enabled: fetchedSettings.attendanceLocation?.enabled !== undefined ? fetchedSettings.attendanceLocation.enabled : false,
                    latitude: fetchedSettings.attendanceLocation?.latitude || 0,
                    longitude: fetchedSettings.attendanceLocation?.longitude || 0,
                    radius: fetchedSettings.attendanceLocation?.radius || 100
                },
                leaveEligibilityValue: fetchedSettings.leaveEligibilityValue !== undefined ? fetchedSettings.leaveEligibilityValue : 3,
                leaveEligibilityUnit: fetchedSettings.leaveEligibilityUnit || 'months',
                leavePolicy: fetchedSettings.leavePolicy || [
                    { type: 'annual', label: 'Annual Leave', defaultDays: 7, scope: 'all', assignedEmployees: [] },
                    { type: 'sick', label: 'Sick Leave', defaultDays: 14, scope: 'all', assignedEmployees: [] },
                    { type: 'hospital', label: 'Hospitalization Leave', defaultDays: 60, scope: 'all', assignedEmployees: [] },
                    { type: 'urgent', label: 'Urgent Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'marriage', label: 'Marriage Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'paternity', label: 'Paternity Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'compassion', label: 'Compassionate Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'personal', label: 'Personal Leave', defaultDays: 3, scope: 'all', assignedEmployees: [] },
                    { type: 'unpaid', label: 'Unpaid Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] },
                    { type: 'homeCountry', label: 'Home Country Leave', defaultDays: 0, scope: 'all', assignedEmployees: [] }
                ],
                localization: fetchedSettings.localization || {
                    country: 'India',
                    currency: 'INR',
                    currencySymbol: '₹',
                    locale: 'en-IN'
                }
            });
            setHasChanges(false);
        } catch (error) {
            if (error.response?.status === 404) {
                setOriginalSettings(settings);
            } else {
                toast.error('Failed to fetch settings');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateCountry = (country) => {
        const map = countryCurrencyMap[country];
        if (!map) return;

        const updatedSettings = {
            ...settings,
            localization: {
                country,
                currency: map.currency,
                currencySymbol: map.symbol,
                locale: map.locale
            }
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle input changes (for non-batch/interval fields)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

        const updatedSettings = {
            ...settings,
            [name]: newValue
        };

        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle batch changes
    const handleBatchChange = (index, field, value) => {
        const updatedBatches = [...settings.batches];
        updatedBatches[index] = {
            ...updatedBatches[index],
            [field]: value
        };
        const updatedSettings = {
            ...settings,
            batches: updatedBatches
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle interval changes
    const handleIntervalChange = (index, field, value) => {
        const updatedIntervals = [...settings.intervals];
        updatedIntervals[index] = {
            ...updatedIntervals[index],
            [field]: value
        };
        const updatedSettings = {
            ...settings,
            intervals: updatedIntervals
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle leave policy changes
    const handleLeavePolicyChange = (index, field, value) => {
        const updatedPolicy = [...settings.leavePolicy];
        updatedPolicy[index] = {
            ...updatedPolicy[index],
            [field]: value
        };
        const updatedSettings = {
            ...settings,
            leavePolicy: updatedPolicy
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleAddOverride = (policyIndex) => {
        const updatedPolicy = [...settings.leavePolicy];
        const policy = { ...updatedPolicy[policyIndex] };
        policy.overrides = [...(policy.overrides || []), { employeeIds: [], days: 0 }];
        updatedPolicy[policyIndex] = policy;
        const updatedSettings = { ...settings, leavePolicy: updatedPolicy };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleRemoveOverride = (policyIndex, overrideIndex) => {
        const updatedPolicy = [...settings.leavePolicy];
        const policy = { ...updatedPolicy[policyIndex] };
        policy.overrides = policy.overrides.filter((_, i) => i !== overrideIndex);
        updatedPolicy[policyIndex] = policy;
        const updatedSettings = { ...settings, leavePolicy: updatedPolicy };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleOverrideChange = (policyIndex, overrideIndex, field, value) => {
        const updatedPolicy = [...settings.leavePolicy];
        const policy = { ...updatedPolicy[policyIndex] };
        const updatedOverrides = [...(policy.overrides || [])];
        updatedOverrides[overrideIndex] = {
            ...updatedOverrides[overrideIndex],
            [field]: value
        };
        policy.overrides = updatedOverrides;
        updatedPolicy[policyIndex] = policy;
        const updatedSettings = { ...settings, leavePolicy: updatedPolicy };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleOverrideEmployeesChange = (policyIndex, overrideIndex, e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        handleOverrideChange(policyIndex, overrideIndex, 'employeeIds', selectedValues);
    };

    const toggleOverrideEmployee = (policyIndex, overrideIndex, employeeId) => {
        const updatedPolicy = [...settings.leavePolicy];
        const policy = { ...updatedPolicy[policyIndex] };
        const updatedOverrides = [...(policy.overrides || [])];
        const currentOverride = { ...updatedOverrides[overrideIndex] };

        const currentIds = currentOverride.employeeIds || [];
        if (currentIds.includes(employeeId)) {
            currentOverride.employeeIds = currentIds.filter(id => id !== employeeId);
        } else {
            currentOverride.employeeIds = [...currentIds, employeeId];
        }

        updatedOverrides[overrideIndex] = currentOverride;
        policy.overrides = updatedOverrides;
        updatedPolicy[policyIndex] = policy;
        const updatedSettings = { ...settings, leavePolicy: updatedPolicy };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const toggleAllOverrideEmployees = (policyIndex, overrideIndex, filteredWorkers) => {
        const updatedPolicy = [...settings.leavePolicy];
        const policy = { ...updatedPolicy[policyIndex] };
        const updatedOverrides = [...(policy.overrides || [])];
        const currentOverride = { ...updatedOverrides[overrideIndex] };

        const currentIds = currentOverride.employeeIds || [];
        const availableWorkerIds = filteredWorkers.filter(w => {
            const isSelectedElsewhere = policy.overrides.some((otherOverride, otherIdx) =>
                otherIdx !== overrideIndex && otherOverride.employeeIds && otherOverride.employeeIds.includes(w._id)
            );
            return !isSelectedElsewhere;
        }).map(w => w._id);

        const allSelected = availableWorkerIds.every(id => currentIds.includes(id)) && availableWorkerIds.length > 0;

        if (allSelected) {
            currentOverride.employeeIds = currentIds.filter(id => !availableWorkerIds.includes(id));
        } else {
            const newSelections = new Set([...currentIds, ...availableWorkerIds]);
            currentOverride.employeeIds = Array.from(newSelections);
        }

        updatedOverrides[overrideIndex] = currentOverride;
        policy.overrides = updatedOverrides;
        updatedPolicy[policyIndex] = policy;
        const updatedSettings = { ...settings, leavePolicy: updatedPolicy };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleAddLeave = () => {
        const newLeave = {
            type: `custom_${Date.now()}`,
            label: 'New Leave Type',
            defaultDays: 0,
            overrides: []
        };
        const updatedSettings = {
            ...settings,
            leavePolicy: [...settings.leavePolicy, newLeave]
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    const handleRemoveLeave = (index) => {
        const updatedPolicy = settings.leavePolicy.filter((_, i) => i !== index);
        const updatedSettings = {
            ...settings,
            leavePolicy: updatedPolicy
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle adding new batch
    const handleAddBatch = () => {
        const newBatch = {
            batchName: '',
            from: '09:00',
            to: '19:00',
            lunchFrom: '12:00',
            lunchTo: '13:00',
            isLunchConsider: false
        };
        const updatedSettings = {
            ...settings,
            batches: [...settings.batches, newBatch]
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle removing batch
    const handleRemoveBatch = (index) => {
        const updatedBatches = settings.batches.filter((_, i) => i !== index);
        const updatedSettings = {
            ...settings,
            batches: updatedBatches
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle adding new interval
    const handleAddInterval = () => {
        const newInterval = {
            intervalName: `interval${settings.intervals.length + 1}`,
            from: '10:15',
            to: '10:30',
            isBreakConsider: false
        };
        const updatedSettings = {
            ...settings,
            intervals: [...settings.intervals, newInterval]
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle removing interval
    const handleRemoveInterval = (index) => {
        const updatedIntervals = settings.intervals.filter((_, i) => i !== index);
        const updatedSettings = {
            ...settings,
            intervals: updatedIntervals
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle location input changes
    const handleLocationChange = (field, value) => {
        const updatedSettings = {
            ...settings,
            attendanceLocation: {
                ...settings.attendanceLocation,
                [field]: value
            }
        };
        setSettings(updatedSettings);
        checkForChanges(updatedSettings);
    };

    // Handle location capture
    const handleCaptureLocation = async () => {
        try {
            // Import the geolocation service function
            const { getCurrentPosition } = await import('../../services/geolocationService');

            const position = await getCurrentPosition();
            // Update both latitude and longitude in a single state update
            const updatedSettings = {
                ...settings,
                attendanceLocation: {
                    ...settings.attendanceLocation,
                    latitude: position.latitude,
                    longitude: position.longitude
                }
            };
            setSettings(updatedSettings);
            checkForChanges(updatedSettings);
            setCurrentLocation(position); // Set the current location state
            toast.success('Location captured successfully');
        } catch (error) {
            console.error('Error capturing location:', error);
            toast.error('Failed to capture location: ' + error.message);
        }
    };

    // Handle settings save
    const handleSaveSettings = async () => {
        if (!validateBatchNames(settings.batches)) {
            toast.error('Batch names must be unique. Please check for duplicate batch names.');
            return;
        }
        if (!validateIntervalNames(settings.intervals)) {
            toast.error('Interval names must be unique. Please check for duplicate interval names.');
            return;
        }
        setSaving(true);
        try {
            const token = getAuthToken();
            await api.put(`/settings/${subdomain}`, settings, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setOriginalSettings(settings);
            setHasChanges(false);
            refreshSettings(); // Refresh global settings in context
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Reset to original settings
    const handleReset = () => {
        setSettings({ ...originalSettings });
        setHasChanges(false);
    };

    // Custom toggle component
    const CustomToggle = ({ checked, onChange, disabled = false }) => (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${checked ? 'bg-black' : 'bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    useEffect(() => {
        if (subdomain && subdomain !== 'main') {
            fetchSettings();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line
    }, [subdomain]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <Spinner size="lg" />
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FiSettings className="mr-3 text-black" />
                                Application Settings
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Configure your application preferences and general settings
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={handleReset}
                                variant="secondary"
                                disabled={!hasChanges || saving}
                                className="flex items-center"
                            >
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                Reset Changes
                            </Button>
                            <Button
                                onClick={handleSaveSettings}
                                variant="primary"
                                disabled={!hasChanges || saving}
                                className="flex items-center"
                            >
                                {saving ? (
                                    <Spinner size="sm" className="mr-2" />
                                ) : (
                                    <FiSave className="mr-2 h-4 w-4" />
                                )}
                                Update Settings
                            </Button>
                        </div>
                    </div>

                    {/* Unsaved changes alert */}
                    {hasChanges && (
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FiAlertTriangle className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800">
                                        Unsaved Changes Detected
                                    </h3>
                                    <div className="mt-2 text-sm text-amber-700">
                                        <p>You have unsaved changes. Click "Update Settings" to save them or "Reset Changes" to discard them.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>



                {/* Additional Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Localization Settings */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400" />
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <FiGlobe className="h-5 w-5 text-blue-600" />
                                </div>
                                Localization Settings
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Country</label>
                                    <select
                                        value={settings.localization?.country}
                                        onChange={(e) => updateCountry(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 bg-white"
                                    >
                                        {Object.keys(countryCurrencyMap).map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</p>
                                        <p className="text-sm font-semibold text-gray-900">{settings.localization?.currency}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</p>
                                        <p className="text-sm font-semibold text-gray-900">{settings.localization?.currencySymbol}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>


                    {/* Attendance Settings */}
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                        <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400" />
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                    <FiUser className="h-5 w-5 text-indigo-600" />
                                </div>
                                Attendance Settings
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Consider Overtime</label>
                                        <p className="text-xs text-gray-500">Include overtime in calculations</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.considerOvertime}
                                        onChange={() => handleInputChange({
                                            target: {
                                                name: 'considerOvertime',
                                                type: 'checkbox',
                                                checked: !settings.considerOvertime
                                            }
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Salary Deduction</label>
                                        <p className="text-xs text-gray-500">Enable salary deductions for breaks</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.deductSalary}
                                        onChange={() => handleInputChange({
                                            target: {
                                                name: 'deductSalary',
                                                type: 'checkbox',
                                                checked: !settings.deductSalary
                                            }
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Deduct Late Minutes</label>
                                        <p className="text-xs text-gray-500">Automatically deduct salary for late arrivals</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.deductLateMinutes}
                                        onChange={() => handleInputChange({
                                            target: {
                                                name: 'deductLateMinutes',
                                                type: 'checkbox',
                                                checked: !settings.deductLateMinutes
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Location Settings */}
                <Card className="mb-8 hover:shadow-lg transition-shadow duration-200">
                    <div className="h-2 bg-gradient-to-r from-teal-400 to-cyan-400" />
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                            <div className="p-2 bg-teal-100 rounded-lg mr-3">
                                <FiMapPin className="h-5 w-5 text-teal-600" />
                            </div>
                            Location Settings
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Enable Location Restriction</label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Restrict attendance to a specific location
                                    </p>
                                </div>
                                <CustomToggle
                                    checked={settings.attendanceLocation.enabled}
                                    onChange={() => handleLocationChange('enabled', !settings.attendanceLocation.enabled)}
                                />
                            </div>

                            {settings.attendanceLocation.enabled && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Latitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={settings.attendanceLocation.latitude}
                                                onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Longitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={settings.attendanceLocation.longitude}
                                                onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Radius (meters)
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="1000"
                                            value={settings.attendanceLocation.radius}
                                            onChange={(e) => handleLocationChange('radius', parseInt(e.target.value) || 100)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Workers must be within this radius to mark attendance (10-1000 meters)
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleCaptureLocation}
                                            variant="secondary"
                                            className="flex items-center"
                                        >
                                            <FiMapPin className="mr-2 h-4 w-4" />
                                            Capture Current Location
                                        </Button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Your browser will ask for location permission.{' '}
                                            {currentLocation ? (
                                                <span>
                                                    Current location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                                    {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                                                </span>
                                            ) : (
                                                <span>
                                                    Location set to: {settings.attendanceLocation.latitude.toFixed(6)}, {settings.attendanceLocation.longitude.toFixed(6)}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="pt-2 bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-blue-700">
                                            <strong>Tip:</strong> Enable location restriction to ensure workers can only mark attendance when they are physically present at the designated location.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Leave Configuration */}
                <Card className="mb-8 hover:shadow-lg transition-shadow duration-200">
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-red-400" />
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                            <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                <FiUser className="h-5 w-5 text-orange-600" />
                            </div>
                            Leave Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Leave Eligibility After Joining
                                </label>
                                <input
                                    type="number"
                                    name="leaveEligibilityValue"
                                    value={settings.leaveEligibilityValue}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                />
                                <p className="text-xs text-gray-500">
                                    Number of days or months before eligible
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Eligibility Unit
                                </label>
                                <select
                                    name="leaveEligibilityUnit"
                                    value={settings.leaveEligibilityUnit}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                >
                                    <option value="months">Months</option>
                                    <option value="days">Days</option>
                                </select>
                                <p className="text-xs text-gray-500">
                                    Unit for eligibility duration
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-md font-semibold text-gray-800">Leave Policy Configuration</h4>
                                    {hasChanges && (
                                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                            <FiAlertTriangle size={10} /> Unsaved changes
                                        </span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddLeave}
                                    className="flex items-center gap-1 shadow-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                                >
                                    <FiPlus /> Add Leave Type
                                </Button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">Leave Type</th>
                                            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Global Default</th>
                                            <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Doc Required</th>
                                            <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Overrides</th>
                                            <th scope="col" className="px-2 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-12"></th>
                                        </tr>
                                    </thead>
                                    {Array.isArray(settings.leavePolicy) && settings.leavePolicy.map((leave, index) => (
                                        <tbody key={leave.type || index} className="bg-white divide-y divide-gray-200 border-b-8 border-gray-50">
                                            <tr className="hover:bg-blue-50/20 transition-colors duration-150 group">
                                                <td className="px-5 py-3 align-top">
                                                    <div className="pt-1 flex flex-col">
                                                        <input
                                                            type="text"
                                                            value={leave.label || ''}
                                                            onChange={(e) => handleLeavePolicyChange(index, 'label', e.target.value)}
                                                            className="w-full bg-transparent border border-transparent focus:border-blue-500 hover:border-gray-300 focus:bg-white focus:ring-0 p-1.5 font-semibold text-gray-900 shadow-sm rounded-sm transition-all md:text-sm text-base placeholder-gray-300"
                                                            placeholder="Leave name..."
                                                        />
                                                        {leave.overrides && leave.overrides.length > 0 && (
                                                            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 self-start shadow-sm border border-blue-100">
                                                                {leave.overrides.length} Custom Rule(s) Active
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top">
                                                    <div className="relative flex items-center pt-1 w-full max-w-[120px]">
                                                        <input
                                                            type="number"
                                                            value={leave.defaultDays ?? 0}
                                                            onChange={(e) => handleLeavePolicyChange(index, 'defaultDays', Number(e.target.value))}
                                                            min="0"
                                                            className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        />
                                                        <span className="ml-1.5 text-xs font-medium text-gray-500">days</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top text-center">
                                                    <div className="pt-1 flex justify-center">
                                                        <CustomToggle
                                                            checked={leave.documentRequired || false}
                                                            onChange={() => handleLeavePolicyChange(index, 'documentRequired', !leave.documentRequired)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top text-center">
                                                    <div className="pt-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddOverride(index)}
                                                            className="text-xs bg-white border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-800 font-semibold px-3 py-1.5 mx-auto flex items-center justify-center transition-all focus:ring-2 focus:ring-blue-100"
                                                        >
                                                            <FiPlus className="mr-1.5" /> Overrides
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 align-top text-right">
                                                    <div className="pt-1 pr-2 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLeave(index)}
                                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded hover:bg-red-50 focus:opacity-100 ring-1 ring-transparent hover:ring-red-100"
                                                            title="Delete Leave Type"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expandable Section for Overrides */}
                                            {leave.overrides && leave.overrides.length > 0 && (
                                                <tr>
                                                    <td colSpan="4" className="bg-gray-50/50 px-5 py-4 border-b border-gray-200">
                                                        <div className="pl-4 border-l-2 border-blue-400 space-y-3">
                                                            <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Policy Overrides</h5>
                                                            {leave.overrides.map((override, oIdx) => (
                                                                <div key={oIdx} className="flex flex-col sm:flex-row items-start gap-5 p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative pr-24 hover:border-blue-200 transition-colors">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveOverride(index, oIdx)}
                                                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold px-2 py-1 rounded border border-transparent hover:border-red-200 flex items-center transition-all bg-white"
                                                                    >
                                                                        <FiTrash2 size={13} className="mr-1" /> Remove
                                                                    </button>

                                                                    <div className="flex-1 w-full sm:w-auto">
                                                                        <div className="w-full flex justify-between items-center mb-1.5">
                                                                            <label className="text-xs font-bold text-gray-700">Override Group {oIdx + 1}: Select Employees</label>
                                                                        </div>

                                                                        <div className="w-full border border-gray-300 rounded shadow-sm bg-white flex flex-col">
                                                                            <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Search employees..."
                                                                                    value={overrideSearch[`${index}-${oIdx}`] || ''}
                                                                                    onChange={(e) => setOverrideSearch({ ...overrideSearch, [`${index}-${oIdx}`]: e.target.value })}
                                                                                    className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                                                />
                                                                            </div>

                                                                            <div className="min-h-[120px] max-h-[180px] overflow-y-auto w-full custom-scrollbar flex flex-col p-1.5 space-y-0.5">
                                                                                {(() => {
                                                                                    const searchStr = (overrideSearch[`${index}-${oIdx}`] || '').toLowerCase();
                                                                                    const filteredWorkers = workers.filter(w =>
                                                                                        w.name.toLowerCase().includes(searchStr) ||
                                                                                        (w.employeeId && w.employeeId.toLowerCase().includes(searchStr)) ||
                                                                                        (w.username && w.username.toLowerCase().includes(searchStr))
                                                                                    );
                                                                                    return filteredWorkers.length > 0 ? (
                                                                                        <Fragment>
                                                                                            <div className="flex justify-between items-center px-1 pb-1 mb-1 border-b border-gray-100">
                                                                                                <span className="text-[10px] uppercase font-semibold text-gray-400">
                                                                                                    {override.employeeIds?.length || 0} Selected
                                                                                                </span>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => toggleAllOverrideEmployees(index, oIdx, filteredWorkers)}
                                                                                                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 focus:outline-none"
                                                                                                >
                                                                                                    Toggle All Visible
                                                                                                </button>
                                                                                            </div>
                                                                                            {filteredWorkers.map(w => {
                                                                                                const isChecked = override.employeeIds?.includes(w._id);
                                                                                                const isSelectedElsewhere = leave.overrides.some((otherOverride, otherIdx) =>
                                                                                                    otherIdx !== oIdx && otherOverride.employeeIds && otherOverride.employeeIds.includes(w._id)
                                                                                                );
                                                                                                const isDisabled = isSelectedElsewhere;
                                                                                                return (
                                                                                                    <label
                                                                                                        key={w._id}
                                                                                                        className={`flex items-center px-2 py-1.5 rounded transition-colors text-xs ${isDisabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'} ${isChecked ? 'bg-blue-50/50' : ''}`}
                                                                                                    >
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={isChecked}
                                                                                                            disabled={isDisabled}
                                                                                                            onChange={() => toggleOverrideEmployee(index, oIdx, w._id)}
                                                                                                            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2.5 cursor-pointer disabled:cursor-not-allowed"
                                                                                                        />
                                                                                                        <div className="flex-1 min-w-0 flex items-center justify-between">
                                                                                                            <span className={`block truncate ${isChecked ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                                                                                                                {w.name} {w.employeeId ? `(${w.employeeId})` : ''}
                                                                                                            </span>
                                                                                                            {isDisabled && (
                                                                                                                <span className="text-[9px] font-medium text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ml-2">
                                                                                                                    In Use
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </label>
                                                                                                );
                                                                                            })}
                                                                                        </Fragment>
                                                                                    ) : (
                                                                                        <span className="text-xs text-gray-500 italic p-3 block text-center">No employees found.</span>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-full sm:w-32">
                                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Override Days</label>
                                                                        <div className="relative flex items-center">
                                                                            <input
                                                                                type="number"
                                                                                value={override.days ?? 0}
                                                                                onChange={(e) => handleOverrideChange(index, oIdx, 'days', Number(e.target.value))}
                                                                                min="0"
                                                                                className="w-16 px-2.5 py-2 text-sm border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-600 font-medium">days</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    ))}
                                </table>
                            </div>

                            {/* Mobile specific hints if needed */}
                            <div className="md:hidden mt-3 mb-1 text-xs text-center text-gray-400">
                                Scroll horizontally to view more fields
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Financial Settings */}
                <Card className="mb-8 hover:shadow-lg transition-shadow duration-200">
                    <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
                            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                                <FiDollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                            Financial Configuration
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Permission Time (Minutes)
                                </label>
                                <input
                                    type="number"
                                    name="permissionTimeMinutes"
                                    value={settings.permissionTimeMinutes}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                />
                                <p className="text-xs text-gray-500">
                                    Default break permission time allowed per employee
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Salary Deduction per Break ({settings.localization?.currencySymbol || '₹'})
                                </label>
                                <input
                                    type="number"
                                    name="salaryDeductionPerBreak"
                                    value={settings.salaryDeductionPerBreak}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900"
                                />
                                <p className="text-xs text-gray-500">
                                    Amount deducted for each unauthorized break
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Work Schedule Configuration */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <FiClock className="mr-2 text-gray-600" />
                        Work Schedule Configuration
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Batches Configuration */}
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400" />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            <FiUser className="h-5 w-5 text-black" />
                                        </div>
                                        Work Batches
                                    </h3>
                                </div>
                                {/* Batches List */}
                                {settings.batches && settings.batches.map((batch, index) => (
                                    <div key={index} className="batch-item border p-4 mb-4 rounded">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold">Batch {index + 1}</h4>
                                            <button
                                                onClick={() => handleRemoveBatch(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        {/* Batch Name */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Batch Name</label>
                                            <input
                                                type="text"
                                                value={batch.batchName}
                                                onChange={(e) => handleBatchChange(index, 'batchName', e.target.value)}
                                                className="w-full p-2 border rounded"
                                                placeholder="Enter batch name"
                                            />
                                        </div>
                                        {/* Working Hours */}
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">From</label>
                                                <input
                                                    type="time"
                                                    value={batch.from}
                                                    onChange={(e) => handleBatchChange(index, 'from', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">To</label>
                                                <input
                                                    type="time"
                                                    value={batch.to}
                                                    onChange={(e) => handleBatchChange(index, 'to', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                        </div>
                                        {/* Lunch Hours */}
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Lunch From</label>
                                                <input
                                                    type="time"
                                                    value={batch.lunchFrom}
                                                    onChange={(e) => handleBatchChange(index, 'lunchFrom', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Lunch To</label>
                                                <input
                                                    type="time"
                                                    value={batch.lunchTo}
                                                    onChange={(e) => handleBatchChange(index, 'lunchTo', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                        </div>
                                        {/* Consider Work at Lunch Toggle */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium">Consider Work at Lunch</label>
                                                <p className="text-xs text-gray-500">Allow employees to work during lunch hours</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={batch.isLunchConsider}
                                                    onChange={(e) => handleBatchChange(index, 'isLunchConsider', e.target.checked)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddBatch}
                                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black"
                                >
                                    Add New Batch
                                </button>
                            </div>
                        </Card>

                        {/* Intervals Configuration */}
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400" />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                            <FiClock className="h-5 w-5 text-gray-900" />
                                        </div>
                                        Break Intervals
                                    </h3>
                                </div>
                                {/* Intervals List */}
                                {settings.intervals && settings.intervals.map((interval, index) => (
                                    <div key={index} className="interval-item border p-4 mb-4 rounded">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold">Interval {index + 1}</h4>
                                            <button
                                                onClick={() => handleRemoveInterval(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        {/* Interval Name */}
                                        <div className="mb-3">
                                            <label className="block text-sm font-medium mb-1">Interval Name</label>
                                            <input
                                                type="text"
                                                value={interval.intervalName}
                                                onChange={(e) => handleIntervalChange(index, 'intervalName', e.target.value)}
                                                className="w-full p-2 border rounded"
                                                placeholder="Enter interval name"
                                            />
                                        </div>
                                        {/* Interval Times */}
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">From</label>
                                                <input
                                                    type="time"
                                                    value={interval.from}
                                                    onChange={(e) => handleIntervalChange(index, 'from', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">To</label>
                                                <input
                                                    type="time"
                                                    value={interval.to}
                                                    onChange={(e) => handleIntervalChange(index, 'to', e.target.value)}
                                                    className="w-full p-2 border rounded"
                                                />
                                            </div>
                                        </div>
                                        {/* Consider Work at Breaks Toggle */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium">Consider Work at Breaks</label>
                                                <p className="text-xs text-gray-500">Allow employees to work during break time</p>
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={interval.isBreakConsider}
                                                    onChange={(e) => handleIntervalChange(index, 'isBreakConsider', e.target.checked)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddInterval}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Add New Interval
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Settings Summary */}
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900">Configuration Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <FiDollarSign className="mr-2 h-4 w-4" />
                                    Financial Settings
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Permission Time:</span>
                                        <span className="font-medium">{settings.permissionTimeMinutes} min</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deduction Amount:</span>
                                        <span className="font-medium">{formatCurrency(settings.salaryDeductionPerBreak, settings)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Consider Overtime:</span>
                                        <span className={settings.considerOvertime ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                            {settings.considerOvertime ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Salary Deduction:</span>
                                        <span className={settings.deductSalary ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                            {settings.deductSalary ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deduct Late Minutes:</span>
                                        <span className={settings.deductLateMinutes ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                            {settings.deductLateMinutes ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <FiMapPin className="mr-2 h-4 w-4" />
                                    Location Settings
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Location Restriction:</span>
                                        <span className={settings.attendanceLocation.enabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                            {settings.attendanceLocation.enabled ? '✓ Enabled' : '✗ Disabled'}
                                        </span>
                                    </div>
                                    {settings.attendanceLocation.enabled && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Latitude:</span>
                                                <span className="font-medium">{settings.attendanceLocation.latitude.toFixed(6)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Longitude:</span>
                                                <span className="font-medium">{settings.attendanceLocation.longitude.toFixed(6)}</span>
                                            </div>
                                            {currentLocation && (
                                                <div className="flex justify-between">
                                                    <span>Current Location:</span>
                                                    <span className="font-medium">
                                                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                                                        {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Radius:</span>
                                                <span className="font-medium">{settings.attendanceLocation.radius}m</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;