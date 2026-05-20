const fs = require('fs');

function rewrite() {
    const path = 'c:\\Users\\Administrator\\Desktop\\cil\\ciphergate_landingpage\\frontend\\src\\components\\admin\\Settings.jsx';
    const content = fs.readFileSync(path, 'utf8');

    const target = '    const CustomToggle = ({ checked, onChange, disabled = false }) => (';
    const parts = content.split(target);
    
    if (parts.length < 2) {
        console.log("Could not find CustomToggle");
        return;
    }

    const new_ui = `    const CustomToggle = ({ checked, onChange, disabled = false }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => { e.preventDefault(); if (!disabled) onChange(); }}
            className={\`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 \${checked ? 'bg-slate-900' : 'bg-slate-200'} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
        >
            <span
                aria-hidden="true"
                className={\`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${checked ? 'translate-x-5' : 'translate-x-0'}\`}
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
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20 font-poppins">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                            <FiSettings className="text-slate-500" />
                            Settings & Preferences
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            Manage organization preferences, policies, and system defaults.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={!hasChanges || saving}
                            className="h-10 px-5 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <FiRefreshCw className={\`mr-2 h-4 w-4 \${saving ? 'animate-spin' : ''}\`} />
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

                <div className="space-y-8">
                    {/* Localization Section */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                <FiGlobe className="text-slate-500 h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Localization</h2>
                                <p className="text-sm text-slate-500 mt-1">Regional and currency configuration.</p>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="max-w-2xl">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Country</label>
                                <select
                                    value={settings.localization?.country}
                                    onChange={(e) => updateCountry(e.target.value)}
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white text-sm outline-none transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")\`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
                                >
                                    {Object.keys(countryCurrencyMap).map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>

                                <div className="mt-6 flex flex-col sm:flex-row gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100/50">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Base Currency</p>
                                        <p className="text-sm font-semibold text-slate-900">{settings.localization?.currency}</p>
                                    </div>
                                    <div className="hidden sm:block w-px bg-slate-200/60"></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Pricing Symbol</p>
                                        <p className="text-sm font-semibold text-slate-900">{settings.localization?.currencySymbol}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Operational & Financial Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Attendance Controls */}
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiClock className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Attendance Policies</h2>
                                </div>
                            </div>
                            <div className="p-8 flex-1 space-y-6">
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
                        </section>

                        {/* Financial Tools */}
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiDollarSign className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Payroll Rules</h2>
                                </div>
                            </div>
                            <div className="p-8 flex-1 space-y-6">
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
                        </section>
                    </div>

                    {/* Geofencing */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FiMapPin className="text-slate-500 h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Location Restrictions</h2>
                                    <p className="text-sm text-slate-500 mt-1">Limit attendance capturing to specific physical boundaries.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={\`text-sm font-medium \${settings.attendanceLocation.enabled ? 'text-slate-900' : 'text-slate-500'}\`}>
                                    {settings.attendanceLocation.enabled ? 'Active' : 'Inactive'}
                                </span>
                                <CustomToggle
                                    checked={settings.attendanceLocation.enabled}
                                    onChange={() => handleLocationChange('enabled', !settings.attendanceLocation.enabled)}
                                />
                            </div>
                        </div>

                        {settings.attendanceLocation.enabled && (
                            <div className="p-8 bg-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
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
                    </section>

                    {/* Leave Policy Table */}
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <FiUser className="text-slate-500 h-4 w-4" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-slate-900">Leave Policies</h2>
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
                                        style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")\`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
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
                                                            style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")\`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
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
                                                                            className={\`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-2 \${
                                                                                isSelected
                                                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                            }\`}
                                                                        >
                                                                            <img 
                                                                                src={worker.photo || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(worker.name)}\`} 
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
                    </section>

                    {/* Operational Limits / Scheduling Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                        {/* Batches */}
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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
                        </section>

                        {/* Intervals */}
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
`;
    
    fs.writeFileSync(path, parts[0] + new_ui);
}

rewrite();
