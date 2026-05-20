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
        if (!subdomain) {
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

    // Removed redundant override functions to match original structure
    // Logic is now handled via handleLeavePolicyChange for scope and assignedEmployees


    const handleAddLeave = () => {
        const newLeave = {
            type: `custom_${Date.now()}`,
            label: 'New Leave Type',
            defaultDays: 0,
            scope: 'all',
            assignedEmployees: []
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

    // Custom toggle component - Guaranteed Pill Shape using Inline Styles
    const CustomToggle = ({ checked, onChange, disabled = false }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => { e.preventDefault(); if (!disabled) onChange(); }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${checked ? 'bg-slate-900' : 'bg-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );

    useEffect(() => {
        if (subdomain) {
            fetchSettings();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line
    }, [subdomain]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20 font-poppins">
            <div className="max-w-full">
                {/* Header Section */}
                <div className="page-header mb-10">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-3 mb-0">
                            <FiSettings className="text-slate-500" />
                            Settings & Preferences
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Manage organization preferences, policies, and system defaults.
                        </p>
                    </div>

                    <div className="header-actions">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={!hasChanges || saving}
                            className="h-10 px-5 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <FiRefreshCw className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                            Discard Changes
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={!hasChanges || saving}
                            className="h-10 px-6 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm flex items-center text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? (
                                <Spinner size="sm" className="mr-2 border-white/20 border-t-white" />
                            ) : (
                                <FiSave className="mr-2 h-4 w-4" />
                            )}
                            Save Settings
                        </Button>
                    </div>
                </div>

                {hasChanges && (
                    <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-200/50 flex items-start gap-4">
                        <FiAlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-semibold text-amber-800">Unsaved Changes</h3>
                            <p className="text-sm text-amber-700 mt-1">You have modified settings that haven't been saved yet. Click "Save Settings" to apply them.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Localization + Attendance + Payroll — 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Localization */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiGlobe className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Localization</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Regional and currency config.</p>
                                </div>
                            </div>
                            <div className="p-5 flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Country</label>
                                <select
                                    value={settings.localization?.country}
                                    onChange={(e) => updateCountry(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white text-sm outline-none transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                                >
                                    {Object.keys(countryCurrencyMap).map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>

                                <div className="mt-4 flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Base Currency</p>
                                        <p className="text-sm font-semibold text-slate-900">{settings.localization?.currency}</p>
                                    </div>
                                    <div className="w-px bg-slate-200/60"></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Pricing Symbol</p>
                                        <p className="text-sm font-semibold text-slate-900">{settings.localization?.currencySymbol}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Attendance Controls */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiClock className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Attendance Policies</h2>
                                </div>
                            </div>
                            <div className="p-5 flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <label className="text-sm font-medium text-slate-900 block">Consider Overtime</label>
                                        <p className="text-xs text-slate-500 mt-1">Include overtime in calculations</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.considerOvertime}
                                        onChange={() => handleInputChange({ target: { name: 'considerOvertime', type: 'checkbox', checked: !settings.considerOvertime } })}
                                    />
                                </div>
                                <div className="h-px bg-slate-100"></div>
                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <label className="text-sm font-medium text-slate-900 block">Deduct Late Minutes</label>
                                        <p className="text-xs text-slate-500 mt-1">Automatically deduct salary for late arrivals</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.deductLateMinutes}
                                        onChange={() => handleInputChange({ target: { name: 'deductLateMinutes', type: 'checkbox', checked: !settings.deductLateMinutes } })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Tools */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiDollarSign className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Payroll Rules</h2>
                                </div>
                            </div>
                            <div className="p-5 flex-1 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="pr-4">
                                        <label className="text-sm font-medium text-slate-900 block">Break Deductions</label>
                                        <p className="text-xs text-slate-500 mt-1">Enable salary deductions for breaks</p>
                                    </div>
                                    <CustomToggle
                                        checked={settings.deductSalary}
                                        onChange={() => handleInputChange({ target: { name: 'deductSalary', type: 'checkbox', checked: !settings.deductSalary } })}
                                    />
                                </div>
                                <div className="h-px bg-slate-100"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Permission Time (Min)</label>
                                        <input
                                            type="number"
                                            name="permissionTimeMinutes"
                                            value={settings.permissionTimeMinutes}
                                            onChange={handleInputChange}
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Break Deduction Target</label>
                                        <input
                                            type="number"
                                            name="salaryDeductionPerBreak"
                                            value={settings.salaryDeductionPerBreak}
                                            onChange={handleInputChange}
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geofencing */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiMapPin className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Location Restrictions</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Limit attendance to specific physical boundaries.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${settings.attendanceLocation.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {settings.attendanceLocation.enabled ? 'Active' : 'Inactive'}
                                </span>
                                <CustomToggle
                                    checked={settings.attendanceLocation.enabled}
                                    onChange={() => handleLocationChange('enabled', !settings.attendanceLocation.enabled)}
                                />
                            </div>
                        </div>

                        {settings.attendanceLocation.enabled && (
                            <div className="p-5 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                    {[
                                        { label: 'Latitude', name: 'latitude' },
                                        { label: 'Longitude', name: 'longitude' },
                                        { label: 'Radius (Meters)', name: 'radius' }
                                    ].map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{field.label}</label>
                                            <input
                                                type="number"
                                                value={settings.attendanceLocation[field.name]}
                                                onChange={(e) => handleLocationChange(field.name, Number(e.target.value))}
                                                className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white text-sm outline-none transition-all font-medium"
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <Button
                                            onClick={handleCaptureLocation}
                                            className="w-full h-11 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium flex items-center justify-center transition-colors text-sm shadow-sm"
                                        >
                                            <FiMapPin className="mr-2 h-4 w-4 text-slate-400" />
                                            Capture Location
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leave Policy Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <FiUser className="text-slate-500 h-4 w-4" />
                                    </div>
                                    <h2 className="text-base font-semibold text-slate-900">Leave Policies</h2>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">Configure leave types and employee eligibility.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600">Eligibility Period:</span>
                                    <input
                                        type="number"
                                        value={settings.leaveEligibilityValue}
                                        onChange={(e) => handleInputChange({ target: { name: 'leaveEligibilityValue', value: Number(e.target.value) } })}
                                        className="w-16 h-9 px-2 text-center border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none text-sm font-medium"
                                    />
                                    <select
                                        value={settings.leaveEligibilityUnit}
                                        onChange={(e) => handleInputChange({ target: { name: 'leaveEligibilityUnit', value: e.target.value } })}
                                        className="h-9 px-3 py-1 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white text-sm outline-none font-medium appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                                    >
                                        <option value="months">Months</option>
                                        <option value="days">Days</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                                <Button
                                    onClick={handleAddLeave}
                                    variant="outline"
                                    className="h-9 px-4 rounded-md border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium flex items-center shadow-sm"
                                >
                                    <FiPlus className="mr-1.5 h-3.5 w-3.5" /> New Category
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                        <th className="px-8 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Name</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Quota</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Docs Reg.</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Scope</th>
                                        <th className="px-8 py-3.5 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {settings.leavePolicy.map((leave, index) => (
                                        <Fragment key={leave.type || index}>
                                            <tr className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <input
                                                        type="text"
                                                        value={leave.label || ''}
                                                        onChange={(e) => handleLeavePolicyChange(index, 'label', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-900 focus:ring-0 px-2 py-1.5 rounded-md text-sm font-medium text-slate-900 transition-all outline-none"
                                                        placeholder="Leave name..."
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={leave.defaultDays ?? 0}
                                                            onChange={(e) => handleLeavePolicyChange(index, 'defaultDays', Number(e.target.value))}
                                                            className="w-16 h-9 text-center border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm font-medium outline-none"
                                                        />
                                                        <span className="text-xs text-slate-500">days</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center">
                                                        <CustomToggle
                                                            checked={leave.documentRequired || false}
                                                            onChange={() => handleLeavePolicyChange(index, 'documentRequired', !leave.documentRequired)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-center gap-1.5 relative">
                                                        <select
                                                            value={leave.scope || 'all'}
                                                            onChange={(e) => handleLeavePolicyChange(index, 'scope', e.target.value)}
                                                            className="h-9 px-3 border border-slate-200 rounded-md bg-transparent focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none appearance-none min-w-[140px]"
                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                                                        >
                                                            <option value="all">All Employees</option>
                                                            <option value="specific">Specific Assign</option>
                                                        </select>
                                                        {leave.scope === 'specific' && (
                                                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded absolute -bottom-5">
                                                                {(leave.assignedEmployees || []).length} Assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <button
                                                        onClick={() => handleRemoveLeave(index)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete category"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                            {leave.scope === 'specific' && (
                                                <tr>
                                                    <td colSpan="5" className="bg-slate-50 px-8 py-6 border-b border-slate-100 shadow-inner">
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-widest pl-1">Assign Personnel to {leave.label}</h5>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleLeavePolicyChange(index, 'assignedEmployees', workers.map(w => w._id))}
                                                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2 py-1 rounded"
                                                                    >
                                                                        Select all
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleLeavePolicyChange(index, 'assignedEmployees', [])}
                                                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2 py-1 rounded"
                                                                    >
                                                                        Clear all
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
                                                                {workers.map((worker) => {
                                                                    const isSelected = (leave.assignedEmployees || []).includes(worker._id);
                                                                    return (
                                                                        <button
                                                                            key={worker._id}
                                                                            onClick={() => {
                                                                                const current = leave.assignedEmployees || [];
                                                                                const updated = isSelected
                                                                                    ? current.filter(id => id !== worker._id)
                                                                                    : [...current, worker._id];
                                                                                handleLeavePolicyChange(index, 'assignedEmployees', updated);
                                                                            }}
                                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-2 ${
                                                                                isSelected
                                                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                            }`}
                                                                        >
                                                                            <img 
                                                                                src={worker.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}`} 
                                                                                className="w-4 h-4 rounded-full" 
                                                                                alt=""
                                                                            />
                                                                            {worker.name}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Operational Limits / Scheduling Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                        {/* Batches */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <FiClock className="text-slate-500 h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Workflow Batches</h2>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddBatch}
                                    variant="outline"
                                    className="h-8 px-3 rounded-md border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center shadow-sm shrink-0"
                                >
                                    <FiPlus className="mr-1.5 h-3.5 w-3.5" /> Add Batch
                                </Button>
                            </div>
                            <div className="p-8 space-y-6 bg-slate-50/50 flex-1">
                                {settings.batches.map((batch, index) => (
                                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group/batch transition-all hover:border-slate-300">
                                        <button
                                            onClick={() => handleRemoveBatch(index)}
                                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover/batch:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                        
                                        <div className="mb-5 pr-8">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider pl-1">Batch Identifier</label>
                                            <input
                                                type="text"
                                                value={batch.batchName}
                                                onChange={(e) => handleBatchChange(index, 'batchName', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:ring-0 p-0 text-base font-semibold text-slate-900 outline-none transition-all placeholder-slate-300"
                                                placeholder="e.g., Morning Shift"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Shift Start</label>
                                                <input
                                                    type="time"
                                                    value={batch.from}
                                                    onChange={(e) => handleBatchChange(index, 'from', e.target.value)}
                                                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Shift End</label>
                                                <input
                                                    type="time"
                                                    value={batch.to}
                                                    onChange={(e) => handleBatchChange(index, 'to', e.target.value)}
                                                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-slate-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-sm font-medium text-slate-900 block">Lunch Break Rules</span>
                                                    <span className="text-xs text-slate-500">Apply deductions automatically</span>
                                                </div>
                                                <CustomToggle
                                                    checked={batch.isLunchConsider}
                                                    onChange={() => handleBatchChange(index, 'isLunchConsider', !batch.isLunchConsider)}
                                                />
                                            </div>

                                            {batch.isLunchConsider && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Lunch Start</label>
                                                        <input
                                                            type="time"
                                                            value={batch.lunchFrom || '12:00'}
                                                            onChange={(e) => handleBatchChange(index, 'lunchFrom', e.target.value)}
                                                            className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none cursor-pointer"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Lunch End</label>
                                                        <input
                                                            type="time"
                                                            value={batch.lunchTo || '13:00'}
                                                            onChange={(e) => handleBatchChange(index, 'lunchTo', e.target.value)}
                                                            className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Intervals */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <FiClock className="text-slate-500 h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Break Intervals</h2>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddInterval}
                                    variant="outline"
                                    className="h-8 px-3 rounded-md border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold flex items-center shadow-sm shrink-0"
                                >
                                    <FiPlus className="mr-1.5 h-3.5 w-3.5" /> Add Interval
                                </Button>
                            </div>
                            <div className="p-8 space-y-6 bg-slate-50/50 flex-1">
                                {settings.intervals.map((interval, index) => (
                                    <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group/interval transition-all hover:border-slate-300">
                                        <button
                                            onClick={() => handleRemoveInterval(index)}
                                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover/interval:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                        
                                        <div className="mb-5 pr-8">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider pl-1">Interval Identifier</label>
                                            <input
                                                type="text"
                                                value={interval.intervalName}
                                                onChange={(e) => handleIntervalChange(index, 'intervalName', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:ring-0 p-0 text-base font-semibold text-slate-900 outline-none transition-all placeholder-slate-300"
                                                placeholder="e.g., Tea Break"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-5">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Pause From</label>
                                                <input
                                                    type="time"
                                                    value={interval.from}
                                                    onChange={(e) => handleIntervalChange(index, 'from', e.target.value)}
                                                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider pl-1">Resume At</label>
                                                <input
                                                    type="time"
                                                    value={interval.to}
                                                    onChange={(e) => handleIntervalChange(index, 'to', e.target.value)}
                                                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-slate-900 block">Exempt from Pay</span>
                                                <span className="text-xs text-slate-500">Do not pay during this interval</span>
                                            </div>
                                            <CustomToggle
                                                checked={interval.isBreakConsider}
                                                onChange={() => handleIntervalChange(index, 'isBreakConsider', !interval.isBreakConsider)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
