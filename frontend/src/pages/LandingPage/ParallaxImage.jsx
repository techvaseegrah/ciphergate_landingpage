import React, { useState, useEffect } from 'react';
import { motion, useTransform, AnimatePresence } from 'framer-motion';

const ParallaxImage = ({ scrollYProgress }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHoveringTask, setIsHoveringTask] = useState(false);
  const [isHoveringSalary, setIsHoveringSalary] = useState(false);

  // New states for the requested popups
  const [isHoveringRFID, setIsHoveringRFID] = useState(false);
  const [isHoveringFace, setIsHoveringFace] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CHANGE: Changed start value from '15vh' to '0px' to eliminate the top gap
  const y = useTransform(scrollYProgress, [0, 0.4], ['0px', '0%']);
  const scale = useTransform(scrollYProgress, [0.05, 0.5], [0.92, 1.1]);


  const attendanceLogs = [
    { name: 'Santhosh', id: 'MU6946', dept: 'Billzzy', date: '2025-12-22', in: '09:01:14 AM', out: '', hours: '00:00:00', img: 'https://i.pravatar.cc/150?u=1' },
    { name: 'Parthiban', id: 'PJ6855', dept: 'F3 Engine', date: '2025-12-22', in: '09:01:07 AM', out: '', hours: '00:00:00', img: 'https://i.pravatar.cc/150?u=2' },
    { name: 'Sudharsan', id: 'OQ1245', dept: 'Finovo', date: '2025-12-20', in: '09:43:45 AM', out: '07:21:10 PM', hours: '09:37:25', img: 'https://i.pravatar.cc/150?u=3' },
    { name: 'Infant Ansker', id: 'OD8631', dept: 'Finovo', date: '2025-12-20', in: '02:47:16 PM', out: '07:20:32 PM', hours: '04:33:16', img: 'https://i.pravatar.cc/150?u=4' },
  ];

  return (
    <motion.section
      // CHANGE: Ensure correct spacing is maintained without large gaps
      className="relative w-full flex flex-col items-center justify-center z-10 pointer-events-auto py-20 max-w-[1280px] mx-auto"

      style={{ y }}
    >
      <div className="w-full px-4">
      <motion.div
  className="text-center mb-2 md:mb-4"
>

          <h2 className="text-3xl md:text-5xl font-black text-[#1A2B3C] tracking-tight">
            Presence is not performance. <span className="text-[#26D07C]">We track both.</span>
          </h2>
        </motion.div>

        <motion.div
         className="w-full max-w-6xl bg-white rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-gray-100 p-4 md:p-6 relative mx-auto"

          style={{ scale}}
        >
        <div className="grid grid-cols-12 gap-6 md:gap-10">

          {/* LEFT SIDEBAR SECTION */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="p-5 bg-[#F8FAFC] rounded-[2.5rem] border border-gray-50 shadow-sm">
              <p className="text-[#67748E] text-[10px] uppercase tracking-widest font-black mb-2">Office Time</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#1A2B3C] font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
            </div>

            <div
              onMouseEnter={() => setIsHoveringTask(true)}
              onMouseLeave={() => setIsHoveringTask(false)}
              className="p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative overflow-hidden cursor-pointer transition-all hover:border-[#26D07C] group"
            >
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[#67748E] text-[10px] font-black uppercase tracking-widest">Daily Task</p>
                  <h3 className="text-3xl font-black text-[#1A2B3C]">12 / 15</h3>
                </div>
                <span className="text-[#26D07C] text-sm font-bold">80%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
               <motion.div
  initial={{ width: 0 }}
  animate={{ width: '80%' }}       // ✅ FIX
  className="h-full bg-[#26D07C] rounded-full"
/>
              </div>
              <p className="text-[10px] text-[#67748E] mt-3 font-semibold italic group-hover:text-[#26D07C]">Hover to manage tasks</p>
            </div>

            <div
              onMouseEnter={() => setIsHoveringSalary(true)}
              onMouseLeave={() => setIsHoveringSalary(false)}
              className="p-5 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group cursor-pointer hover:border-[#26D07C] transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[#67748E] text-[10px] font-black uppercase tracking-widest">Salary Management</p>
                  <h3 className="text-xl font-black text-[#1A2B3C] mt-1">Monthly Payroll</h3>
                </div>
                <div className="bg-[#26D07C]/10 p-2 rounded-xl group-hover:bg-[#26D07C] group-hover:text-white transition-colors">
                  <svg className="w-5 h-5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-[#67748E]">Generating Slips...</span>
                  <span className="text-[#26D07C]">75%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ x: ['-100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-[#26D07C] rounded-full" />
                </div>
                <p className="text-[10px] text-[#67748E] font-medium italic">Hover to view report</p>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN TABLE SECTION */}
          <div className="col-span-12 lg:col-span-9 bg-white rounded-[3rem] border border-gray-100 p-5 md:p-6 flex flex-col relative overflow-hidden">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2">
              <h4 className="text-2xl font-black text-[#1A2B3C] font-poppins">Recent Logs</h4>

              <div className="flex items-center gap-3">
                <button
                  onMouseEnter={() => setIsHoveringRFID(true)}
                  onMouseLeave={() => setIsHoveringRFID(false)}
                  className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B7A6F] text-white px-5 py-2.5 rounded-2xl shadow-md transition-all font-bold text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                  </svg>
                  RFID Attendance
                </button>
                <button
                  onMouseEnter={() => setIsHoveringFace(true)}
                  onMouseLeave={() => setIsHoveringFace(false)}
                  className="flex items-center gap-2 bg-[#0D9488] hover:bg-[#0B7A6F] text-white px-5 py-2.5 rounded-2xl shadow-md transition-all font-bold text-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Face Attendance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[12px] font-bold text-[#64748b] border-b border-gray-100">
                    <th className="pb-4 px-4">Name</th>
                    <th className="pb-4 px-4">Emp ID</th>
                    <th className="pb-4 px-4">Dept</th>
                    <th className="pb-4 px-4">Date</th>
                    <th className="pb-4 px-4">In Time</th>
                    <th className="pb-4 px-4">Out Time</th>
                    <th className="pb-4 px-4">Work Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log, i) => (
                    <tr key={i} className={`${i % 2 !== 0 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={log.img} className="w-8 h-8 rounded-full" alt="" />
                        <span className="text-[13px] font-medium text-[#3b82f6]">{log.name}</span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#64748b]">{log.id}</td>
                      <td className="py-3 px-4 text-[12px] text-[#64748b]">{log.dept}</td>
                      <td className="py-3 px-4 text-[12px] text-[#64748b]">{log.date}</td>
                      <td className="py-3 px-4 text-[12px] font-semibold text-[#22c55e]">{log.in}</td>
                      <td className="py-3 px-4 text-[12px] font-semibold text-[#ef4444]">{log.out}</td>
                      <td className="py-3 px-4 text-[12px] text-[#64748b]">{log.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RFID POPUP */}
            <AnimatePresence>
              {isHoveringRFID && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-[#0D9488] text-white px-8 py-4 rounded-3xl shadow-2xl font-bold text-lg border-2 border-white/20"
                >
                  RFID punch in successfull
                </motion.div>
              )}
            </AnimatePresence>

            {/* FACE RECOGNITION POPUP */}
            <AnimatePresence>
              {isHoveringFace && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-[#0D9488] text-white px-8 py-4 rounded-3xl shadow-2xl font-bold text-lg border-2 border-white/20"
                >
                  face reconition successful
                </motion.div>
              )}
            </AnimatePresence>

            {/* SALARY SUMMARY OVERLAY */}
            <AnimatePresence>
              {isHoveringSalary && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-50 bg-white p-8 flex flex-col overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-[#334155]">Summary</h2>
                    <button onClick={() => setIsHoveringSalary(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Top Section */}
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <p className="text-[15px]"><span className="font-bold text-[#1e293b]">Tech Vaseegrah:</span> <span className="text-[#475569]">Senior Developer</span></p>
                        <p className="text-[15px]"><span className="font-bold text-[#1e293b]">Employee Name:</span> <span className="text-[#475569]">Arun R</span></p>
                        <p className="text-[15px]"><span className="font-bold text-[#1e293b]">Employee ID:</span> <span className="text-[#475569]">LF3643</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[15px]"><span className="font-bold text-[#1e293b]">Original Salary:</span> <span className="text-[#475569]">₹7000.00</span></p>
                        <p className="text-[15px]"><span className="font-bold text-[#1e293b]">Actual Earned Salary:</span> <span className="text-[#475569]">₹3727.34</span></p>
                        <p className="text-[15px] font-bold"><span className="text-[#1e293b]">Total Final Salary:</span> <span className="text-[#1e293b]">₹3727.34</span></p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Days in Period:</p><p className="text-[15px] font-bold text-[#1e293b]">31</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Working Days:</p><p className="text-[15px] font-bold text-[#1e293b]">27</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Absent Days:</p><p className="text-[15px] font-bold text-[#1e293b]">9</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Holidays:</p><p className="text-[15px] font-bold text-[#1e293b]">0</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Sundays:</p><p className="text-[15px] font-bold text-[#1e293b]">4</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Actual Working Days:</p><p className="text-[15px] font-bold text-[#1e293b]">18</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Working Hours:</p><p className="text-[15px] font-bold text-[#1e293b]">136.31 hrs</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Permission Time:</p><p className="text-[13px] font-bold text-[#1e293b]">1956.46 mins</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Absent Deduction:</p><p className="text-[15px] font-bold text-[#1e293b]">₹2333.33</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Permission Deduction:</p><p className="text-[15px] font-bold text-[#1e293b]">₹939.33</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Total Deductions:</p><p className="text-[15px] font-bold text-[#1e293b]">₹3272.66</p></div>
                      <div><p className="text-[13px] font-bold text-[#1e293b] leading-tight mb-1">Attendance Rate:</p><p className="text-[15px] font-bold text-[#1e293b]">66.67%</p></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TASK MANAGEMENT OVERLAY */}
            <AnimatePresence>
              {isHoveringTask && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[#F1F5F9] p-6 flex flex-col">
                  <h2 className="text-xl font-black text-[#1A2B3C] font-poppins mb-6">Task Management</h2>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {[{ topic: 'ஸ்டிக்கர் ஒட்டினேன்', pts: 1 }, { topic: 'பார்கோடு ஒட்டினேன்', pts: 0 }, { topic: 'மிசின் சுத்தம் செய்தேன்', pts: 2 }].map((item, idx) => (
                      <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-blue-900">{item.topic} ({item.pts} pts)</span>
                        <div className="bg-[#26D07C] text-white px-3 py-1 rounded-md text-[9px] font-bold">View Details</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RECOGNITION WIDGET */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-6 -right-6 bg-white p-5 rounded-[2.5rem] shadow-xl border border-gray-50 hidden md:flex items-center gap-4 pointer-events-none">
          <div className="w-12 h-12 bg-[#26D07C]/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <svg className="w-7 h-7 text-[#26D07C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2-2h-2M7 21H5a2 2 0 01-2-2v-2" /></svg>
            <motion.div animate={{ top: ['-20%', '120%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-0.5 bg-[#26D07C] shadow-[0_0_8px_#26D07C]" />
          </div>
          <div className="text-left">
            <p className="text-[#1A2B3C] font-black text-[13px] leading-tight">Face Recognition</p>
            <p className="text-[#26D07C] text-[11px] font-bold">Active</p>
          </div>
        </motion.div>
      </motion.div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }`}</style>
    </motion.section>
  );
};

export default ParallaxImage;