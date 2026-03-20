import React, { useState, useEffect } from 'react';
import { motion, useTransform, AnimatePresence } from 'framer-motion';

const timezones = [
  { label: 'India Office', timeZone: 'Asia/Kolkata' },
  { label: 'US Office (EST)', timeZone: 'America/New_York' },
  { label: 'Singapore Office', timeZone: 'Asia/Singapore' },
  { label: 'UK Office', timeZone: 'Europe/London' }
];

const ParallaxImage = ({ scrollYProgress }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTimezoneIndex, setCurrentTimezoneIndex] = useState(0);
  const [isHoveringTask, setIsHoveringTask] = useState(false);
  const [isHoveringSalary, setIsHoveringSalary] = useState(false);

  // New states for the requested popups
  const [isHoveringRFID, setIsHoveringRFID] = useState(false);
  const [isHoveringFace, setIsHoveringFace] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tzTimer = setInterval(() => {
      setCurrentTimezoneIndex((prevIndex) => (prevIndex + 1) % timezones.length);
    }, 3000);
    return () => clearInterval(tzTimer);
  }, []);

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    typeof window !== 'undefined' && window.innerWidth < 768 ? ['0px', '0px'] : ['0px', '-50px']
  );

  // Responsive scale transform to prevent horizontal overflow on mobile
  const scale = useTransform(
    scrollYProgress,
    [0.05, 0.5],
    typeof window !== 'undefined' && window.innerWidth < 768 ? [0.95, 1.0] : [0.92, 1.1]
  );


  const attendanceLogs = [
    { name: 'Santhosh', id: 'MU6946', dept: 'Billzzy', date: '2025-12-22', in: '09:01:14 AM', out: '-', hours: '00:00:00', img: 'https://i.pravatar.cc/150?u=1' },
    { name: 'Parthiban', id: 'PJ6855', dept: 'F3 Engine', date: '2025-12-22', in: '09:01:07 AM', out: '-', hours: '00:00:00', img: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Sudharsan', id: 'OQ1245', dept: 'Finovo', date: '2025-12-20', in: '09:43:45 AM', out: '07:21:10 PM', hours: '09:37:25', img: 'https://i.pravatar.cc/150?u=3' },
    { name: 'Infant Ansker', id: 'OD8631', dept: 'Finovo', date: '2025-12-20', in: '02:47:16 PM', out: '07:20:32 PM', hours: '04:33:16', img: 'https://i.pravatar.cc/150?u=4' },
  ];

  return (
    <motion.section
      className="relative w-full flex flex-col items-center justify-center z-10 pointer-events-auto py-8 md:py-24 max-w-[1200px] mx-auto bg-transparent"
      style={{ y }}
    >
      <div className="w-full px-2 sm:px-6">
        <motion.div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-light text-[#111] tracking-tighter md:tracking-widest uppercase mb-4 leading-[1.1]">
            Presence is not performance. <br className="sm:hidden" />
            <span className="text-rose-gold-animate font-medium tracking-tight">We track both.</span>
          </h2>
        </motion.div>

        <motion.div
          className="w-full max-w-6xl bg-white border border-gray-200 p-2 sm:p-6 md:p-10 relative mx-auto"
          style={{ scale }}
        >
          <div className="grid grid-cols-12 gap-4 sm:gap-8 md:gap-12">
            {/* LEFT SIDEBAR SECTION */}
            <div className="col-span-12 lg:col-span-3 space-y-3 sm:space-y-6">
              <div className="p-3 sm:p-6 bg-[#fafafa] border border-gray-100 min-h-[90px] sm:min-h-[120px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTimezoneIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col"
                  >
                    <p className="text-[#888] text-[9px] uppercase tracking-[0.2em] font-medium mb-3">{timezones[currentTimezoneIndex].label}</p>
                    <h2 className="text-xl md:text-3xl font-light text-[#111] tracking-wider">
                      {currentTime.toLocaleTimeString('en-US', {
                        timeZone: timezones[currentTimezoneIndex].timeZone,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </h2>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div
                onMouseEnter={() => setIsHoveringTask(true)}
                onMouseLeave={() => setIsHoveringTask(false)}
                className="p-3 sm:p-6 bg-white border border-gray-100 relative overflow-hidden cursor-pointer transition-all duration-400 hover:border-[#111] group"
                data-cursor-text="MANAGE TASK"
              >
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[#888] text-[9px] font-medium uppercase tracking-[0.2em] mb-2">Daily Task</p>
                    <h3 className="text-2xl sm:text-3xl font-light text-[#111]">12<span className="text-gray-400 text-lg">/15</span></h3>
                  </div>
                  <span className="text-[#111] text-xs font-semibold tracking-widest">80%</span>
                </div>
                <div className="w-full h-[1px] bg-gray-200 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    className="absolute top-0 left-0 h-full bg-[#111]"
                  />
                </div>
                <p className="text-[9px] text-[#888] mt-4 font-light tracking-[0.1em] uppercase group-hover:text-[#111] transition-colors">Hover to manage</p>
              </div>

              <div
                onMouseEnter={() => setIsHoveringSalary(true)}
                onMouseLeave={() => setIsHoveringSalary(false)}
                className="p-3 sm:p-6 bg-[#111] border border-[#111] relative overflow-hidden group cursor-pointer transition-all duration-400"
                data-cursor-text="PAYROLL"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-[9px] font-medium uppercase tracking-[0.2em] mb-2">Salary Management</p>
                    <h3 className="text-xl font-light text-white tracking-wide">Monthly<br />Payroll</h3>
                  </div>
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-medium tracking-[0.1em] uppercase text-gray-400">
                    <span>Generating...</span>
                    <span className="text-white">75%</span>
                  </div>
                  <div className="w-full h-[1px] bg-gray-800 relative">
                    <motion.div animate={{ x: ['-100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-0 h-full w-full bg-white" />
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 font-light tracking-[0.1em] uppercase">Hover to view</p>
                </div>
              </div>
            </div>

            {/* RIGHT MAIN TABLE SECTION */}
            <div className="col-span-12 lg:col-span-9 bg-[#fafafa] border border-gray-200 p-2 sm:p-6 md:p-8 flex flex-col relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-8">
                <h4 className="text-[11px] md:text-lg font-light tracking-[0.1em] md:tracking-[0.2em] text-[#111] uppercase">Recent Logs</h4>

                <div className="flex items-center gap-1.5 sm:gap-4 w-full sm:w-auto">
                  <button
                    onMouseEnter={() => setIsHoveringRFID(true)}
                    onMouseLeave={() => setIsHoveringRFID(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-3 bg-white hover:bg-[#111] hover:text-white text-[#111] border border-gray-200 hover:border-[#111] px-2 sm:px-6 py-2.5 sm:py-3 transition-all duration-400 font-medium text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em]"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                    RFID Sync
                  </button>
                  <button
                    onMouseEnter={() => setIsHoveringFace(true)}
                    onMouseLeave={() => setIsHoveringFace(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-3 bg-white hover:bg-[#111] hover:text-white text-[#111] border border-gray-200 hover:border-[#111] px-2 sm:px-6 py-2.5 sm:py-3 transition-all duration-400 font-medium text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em]"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Face Sync
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[8px] sm:text-[9px] font-medium text-gray-400 tracking-[0.05em] sm:tracking-[0.15em] uppercase border-b border-gray-200">
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium">Name</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium hidden sm:table-cell">ID</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium hidden md:table-cell">Dept</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium hidden lg:table-cell">Date</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium">In</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium">Out</th>
                      <th className="pb-3 md:pb-4 px-1.5 sm:px-4 font-medium">Hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.map((log, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 flex items-center gap-1.5 sm:gap-4" data-cursor-text="PROFILE">
                          <img src={log.img} className="w-4 h-4 sm:w-6 sm:h-6" alt="" />
                          <span className="text-[9px] sm:text-xs font-light text-[#111] tracking-tight truncate max-w-[50px] sm:max-w-none">{log.name}</span>
                        </td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-light text-gray-500 hidden sm:table-cell">{log.id}</td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-light text-gray-500 hidden md:table-cell">{log.dept}</td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-light text-gray-500 hidden lg:table-cell">{log.date}</td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-medium text-green-500 whitespace-nowrap">{log.in.replace(' AM', 'A').replace(' PM', 'P')}</td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-medium text-red-500 whitespace-nowrap">{log.out.replace(' AM', 'A').replace(' PM', 'P')}</td>
                        <td className="py-2.5 md:py-4 px-1.5 sm:px-4 text-[9px] sm:text-xs font-light text-gray-500">{log.hours.split(':')[0] + 'h'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Popup Overlays */}
              <AnimatePresence>
                {isHoveringRFID && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-[#111] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] border border-gray-800 shadow-2xl"
                  >
                    RFID Synced
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isHoveringFace && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-[#111] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] border border-gray-800 shadow-2xl"
                  >
                    Biometrics Synced
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SALARY SUMMARY OVERLAY */}
              <AnimatePresence>
                {isHoveringSalary && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-[#fafafa] p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-10 border-b border-gray-200 pb-6">
                      <h2 className="text-xl font-light tracking-[0.2em] text-[#111] uppercase">Payroll Report</h2>
                      <button onClick={() => setIsHoveringSalary(false)} className="text-gray-400 hover:text-[#111] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="space-y-10">
                      {/* Top Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <p className="text-xs font-light text-[#111] tracking-wide"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">Position</span> Developer</p>
                          <p className="text-xs font-light text-[#111] tracking-wide"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">Employee</span> Infant</p>
                          <p className="text-xs font-light text-[#111] tracking-wide"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">ID</span> LF3643</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-xs font-light text-[#111] tracking-wide"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">Base Salary</span> ₹7,000.00</p>
                          <p className="text-xs font-light text-[#111] tracking-wide"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">Earned</span> ₹3,727.34</p>
                          <p className="text-lg font-medium text-[#111] tracking-wide py-2 border-t border-gray-200"><span className="text-gray-400 uppercase tracking-[0.1em] text-[9px] block mb-1">Net Pay</span> ₹3,727.34</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 border-t border-gray-200 pt-10">
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Period Days</p><p className="text-sm font-light text-[#111]">31</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Working Days</p><p className="text-sm font-light text-[#111]">27</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Absent Days</p><p className="text-sm font-light text-[#111]">9</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Holidays</p><p className="text-sm font-light text-[#111]">0</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Sundays</p><p className="text-sm font-light text-[#111]">4</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Actual Days</p><p className="text-sm font-light text-[#111]">18</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Total Hours</p><p className="text-sm font-light text-[#111]">136.31h</p></div>
                        <div><p className="text-[9px] font-medium text-gray-400 tracking-[0.1em] uppercase mb-2">Attendance Rate</p><p className="text-sm font-light text-[#111]">66.67%</p></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TASK MANAGEMENT OVERLAY */}
              <AnimatePresence>
                {isHoveringTask && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[#fafafa] p-8 md:p-12 flex flex-col border border-gray-200">
                    <h2 className="text-xl font-light tracking-[0.2em] text-[#111] uppercase mb-10 border-b border-gray-200 pb-6">Task Journal</h2>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                      {[{ topic: 'ஸ்டிக்கர் ஒட்டினேன்', pts: 1 }, { topic: 'பார்கோடு ஒட்டினேன்', pts: 0 }, { topic: 'மிசின் சுத்தம் செய்தேன்', pts: 2 }].map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 p-5 flex justify-between items-center transition-colors hover:border-[#111]">
                          <div className="flex flex-col">
                            <span className="text-xs font-light text-[#111] tracking-wide mb-1 opacity-80">{item.topic}</span>
                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-[0.1em]">{item.pts} points</span>
                          </div>
                          <button className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#111] border-b border-transparent hover:border-[#111] transition-colors pb-1">Details</button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RECOGNITION WIDGET */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-6 -right-6 bg-white p-6 border border-gray-200 hidden md:flex items-center gap-6 pointer-events-none shadow-xl">
            <div className="w-10 h-10 border border-gray-200 flex items-center justify-center relative overflow-hidden">
              <svg className="w-5 h-5 text-[#111]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M3 7V5h2M17 3h2v2M21 17v2h-2M7 21H5v-2" /></svg>
              <motion.div animate={{ top: ['-20%', '120%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-[1px] bg-[#111] opacity-50" />
            </div>
            <div className="text-left">
              <p className="text-[#111] font-light text-xs tracking-[0.1em] uppercase mb-1">Face Capture</p>
              <p className="text-gray-400 text-[9px] font-medium tracking-[0.2em] uppercase">Active Sync</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; }`}</style>
    </motion.section>
  );
};

export default ParallaxImage;