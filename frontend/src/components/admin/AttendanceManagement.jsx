import React, { Fragment, useRef, useState, useEffect, useContext, useCallback } from 'react';
import { FaDownload, FaPlus, FaExclamationTriangle, FaCamera, FaChevronDown, FaUserCircle } from 'react-icons/fa';
import { FiFilter, FiDownload, FiSearch, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Webcam from "react-webcam";
import jsQR from "jsqr";
import appContext from '../../context/AppContext';
import { toast } from 'react-toastify';
import { putAttendance, getAttendance, getPaginatedAttendance, getWorkerLastAttendance } from '../../services/attendanceService';
import Table from '../common/Table';
import Spinner from '../common/Spinner';
import { Link } from 'react-router-dom';
import FaceAttendance from './FaceAttendance';

const AttendanceManagement = () => {
    const [worker, setWorker] = useState({ rfid: "" });
    const [qrText, setQrText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFaceAttendanceOpen, setIsFaceAttendanceOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterRfid, setFilterRfid] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const webcamRef = useRef(null);
    const inputRef = useRef(null);
    const [isPunching, setIsPunching] = useState(false);
    
    // New state variables for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    const { subdomain } = useContext(appContext);
    const [confirmAction, setConfirmAction] = useState(null);

    const uniqueRfids = React.useMemo(() => {
        const rfids = attendanceData.map(record => record.rfid).filter(rfid => rfid && rfid.trim() !== '');
        console.log("All RFIDs:", rfids);
        const unique = [...new Set(rfids)];
        console.log("Unique RFIDs:", unique);
        return unique;
    }, [attendanceData]);

    const fetchAttendanceData = useCallback(async (page = 1, append = false) => {
        if (!subdomain) return;
        
        let isMounted = true;
        
        try {
            if (append) {
                setIsFetchingMore(true);
            } else {
                setIsLoading(true);
            }
            
            const data = await getPaginatedAttendance({ subdomain, page, limit: 10 });
            if (!isMounted) return;

            const rawData = Array.isArray(data.attendance) ? data.attendance : [];
            
            if (append) {
                setAttendanceData(prevData => [...prevData, ...rawData]);
            } else {
                setAttendanceData(rawData);
            }
            
            setHasMore(data.hasMore);
            setCurrentPage(page);
        } catch (error) {
            if (isMounted) {
                console.error('Attendance fetch error:', error);
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
                setIsFetchingMore(false);
            }
        }

        return () => { isMounted = false; };
    }, [subdomain]);

    // Load initial data
    useEffect(() => {
        let isMounted = true;
        
        if (subdomain) {
            fetchAttendanceData(1, false);
        }
        
        return () => { isMounted = false; };
    }, [subdomain, fetchAttendanceData]);

    // Function to load more data
    const loadMoreAttendance = () => {
        if (hasMore && !isFetchingMore) {
            fetchAttendanceData(currentPage + 1, true);
        }
    };

    // Function to refresh the latest attendance records (for real-time updates)
    const refreshLatestAttendance = useCallback(async () => {
        if (!subdomain) return;
        
        try {
            const data = await getPaginatedAttendance({ subdomain, page: 1, limit: 10 });
            const rawData = Array.isArray(data.attendance) ? data.attendance : [];
            
            // Update only the first page of data to show latest records at the top
            setAttendanceData(prevData => {
                // Get existing data that's not part of the first page
                const existingOtherPages = prevData.filter(record => {
                    // This is a simplified approach - in a real implementation, you might want to track
                    // which records belong to which date groups
                    return !rawData.some(newRecord => newRecord._id === record._id);
                });
                
                // Combine new first page with existing other pages
                return [...rawData, ...existingOtherPages];
            });
        } catch (error) {
            console.error("Failed to refresh latest attendance:", error);
        }
    }, [subdomain]);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!subdomain) {
          toast.error('Subdomain not found, check the URL.');
          return;
        }
        if (!worker.rfid.trim()) {
          toast.error('Enter the RFID');
          return;
        }
        
        try {
          const res = await getWorkerLastAttendance(worker.rfid.trim(), subdomain);
          // res.presence is true if next action is Punch In, false if Punch Out
          const next = res.presence ? 'Punch In' : 'Punch Out';
          setConfirmAction(next);
        } catch (error) {
          toast.error(error.message || 'Failed to check worker attendance status');
        }
      };
      
      const handleCancel = () => setConfirmAction(null);
      
      const handleConfirm = () => {
        setIsPunching(true);
        const presenceValue = confirmAction === 'Punch In';
        console.log("Sending attendance request with RFID:", worker.rfid, "subdomain:", subdomain, "presence:", presenceValue);
        
        putAttendance({ rfid: worker.rfid.trim(), subdomain, presence: presenceValue })
          .then(res => {
            if (res.success === false) {
                toast.warning(res.message);
                return;
            }
            toast.success(res.message || 'Attendance marked successfully!');
            setTimeout(() => {
              refreshLatestAttendance();
            }, 500);
          })
          .catch(err => {
            console.error("Attendance error:", err);
            toast.error(err.message || 'Failed to mark attendance.');
          })
          .finally(() => {
            setIsPunching(false);
            setConfirmAction(null);
            setWorker({ rfid: '' });
          });
      };

    useEffect(() => {
        const interval = setInterval(() => {
            scanQRCode();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
              if (isModalOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }, [isModalOpen]);

    useEffect(() => {
              
        if (isModalOpen && !confirmAction && inputRef.current) {
            inputRef.current.focus();
        }
    }, [confirmAction, isModalOpen]);        

    const scanQRCode = () => {
        if (webcamRef.current) {
            const video = webcamRef.current.video;
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext("2d");

                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    setQrText(code.data);
                    console.log("QR Code Data:", code.data);
                    setWorker({ ...worker, rfid: code.data });
                }
            }
        }
    };

    // Replace the existing filteredAttendance variable with:
    const filteredAttendance = attendanceData.filter(record => {
        const matchesName = !searchName || record?.name?.toLowerCase().includes(searchName.toLowerCase());
        const matchesDepartment = !filterDepartment || record?.departmentName?.toLowerCase().includes(filterDepartment.toLowerCase());
        const matchesDate = !filterDate || (record.date && record.date.startsWith(filterDate));
        const matchesRfid = !filterRfid || record?.rfid?.toLowerCase().includes(filterRfid.toLowerCase());
        return matchesName && matchesDepartment && matchesDate && matchesRfid;
    });

    const processedAttendance = processAttendanceByDay(filteredAttendance);

    function processAttendanceByDay(attendanceData) {
        // Helper to parse time string
        function parseTime12hToSeconds(timeStr) {
            if (!timeStr || typeof timeStr !== 'string') return 0;
            const parts = timeStr.trim().split(' ');
            if (parts.length < 2) return 0;
            const [time, modifier] = parts;
            let [hours, minutes, seconds] = time.split(':').map(Number);
            if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
            else if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
            return hours * 3600 + (minutes || 0) * 60 + (seconds || 0);
        }

        function formatSecondsToDuration(totalSeconds) {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
        }

        // Group by Employee + Date
        const grouped = {};
        attendanceData.forEach(record => {
            const dateKey = record.date;
            const key = `${record.rfid}_${dateKey}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(record);
        });

        const finalRows = [];

        Object.values(grouped).forEach(punches => {
            if (!punches || punches.length === 0) return;

            // Sort punches for this employee/day chronologically
            const sorted = punches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            const firstPunch = sorted[0];
            const latestTimestamp = Math.max(...sorted.map(p => new Date(p.createdAt).getTime()));
            
            const dayRecord = {
                ...firstPunch,
                inTimes: [],
                outTimes: [],
                durationSeconds: 0,
                duration: '00:00:00',
                latestTimestamp
            };

            let currentInPunch = null;

            sorted.forEach(punch => {
                if (punch.presence) { // IN
                    if (currentInPunch) {
                        // Previous IN punch missed its OUT punch
                        dayRecord.outTimes.push({ time: '-', isMissed: true });
                    }
                    currentInPunch = punch;
                    dayRecord.inTimes.push({ time: punch.time, isMissed: false });
                } else { // OUT
                    if (currentInPunch) {
                        // Successful IN-OUT pair
                        dayRecord.outTimes.push({ time: punch.time, isMissed: false });
                        const inSec = parseTime12hToSeconds(currentInPunch.time);
                        const outSec = parseTime12hToSeconds(punch.time);
                        if (outSec > inSec) {
                            dayRecord.durationSeconds += (outSec - inSec);
                        }
                        currentInPunch = null;
                    } else {
                        // OUT without preceding IN (orphan OUT punch)
                        dayRecord.outTimes.push({ time: punch.time, isMissed: true });
                    }
                }
            });

            if (currentInPunch) {
                // Last IN punch of the day has no OUT punch
                dayRecord.outTimes.push({ time: '-', isMissed: true });
            }

            // If there were no IN punches all day
            if (dayRecord.inTimes.length === 0) {
                dayRecord.inTimes.push({ time: '-', isMissed: true });
            }
            
            dayRecord.duration = formatSecondsToDuration(dayRecord.durationSeconds);

            finalRows.push(dayRecord);
        });

        return finalRows.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    }

    // Function to download attendance data as CSV
    const downloadAttendanceCSV = () => {
        if (processedAttendance.length === 0) {
            toast.warning("No attendance data to download");
            return;
        }
    
        const headers = [
            'Name',
            'Employee ID (RFID)',
            'Department',
            'Date',
            'In Times',
            'Out Times',
            'Duration'
        ];
    
        const csvRows = processedAttendance.map(record => [
            record?.name || 'Unknown',
            record?.rfid || 'Unknown',
            record?.departmentName || 'N/A',
            record.date || 'Unknown',
            record.inTimes.map(inTime => inTime.time).join(' | '), // Extract time values
            record.outTimes.map(outTime => outTime.time).join(' | '), // Extract time values
            record.duration || '00:00:00'
        ]);
    
        let csvContent = headers.join(',') + '\n';
        csvRows.forEach(row => {
            const formattedRow = row.map(cell => {
                if (cell === null || cell === undefined) return '';
                const cellString = String(cell);
                if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
                    return `"${cellString.replace(/"/g, '""')}"`;
                }
                return cellString;
            });
            csvContent += formattedRow.join(',') + '\n';
        });
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
    
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        link.setAttribute('download', `Attendance_Report_${formattedDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        toast.success("Attendance report downloaded successfully!");
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (record) => (
                <div className="flex items-center py-1">
                    {record?.photo && (
                        <img
                            src={record.photo
                                ? record.photo
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name)}`}
                            alt="Employee"
                            className="w-8 h-8 rounded-full mr-2"
                        />
                    )}
                    <Link to={`/admin/attendance/${record.worker?._id}`} className="text-black hover:underline">
                        {record?.name || 'Unknown'}
                    </Link>
                </div>
            )
        },
        {
            header: 'Employee ID',
            accessor: 'rfid',
            render: (record) => <div className="flex items-center py-1">{record?.rfid || 'Unknown'}</div>
        },
        {
            header: 'Department',
            accessor: 'departmentName',
            render: (record) => <div className="flex items-center py-1">{record?.departmentName || 'N/A'}</div>
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (record) => <div className="flex items-center py-1">{record.date || 'Unknown'}</div>
        },
        {
            header: 'In Time',
            accessor: 'inTimes',
            render: (record) => (
                <div className="flex flex-col justify-center py-1">
                    {record.inTimes.map((inPunch, index) => (
                        <div key={index} className={`py-0.5 ${inPunch.time === '-' ? 'text-gray-500' : 'text-green-600'}`}>{inPunch.time}</div>
                    ))}
                </div>
            )
        },
        {
            header: 'Out Time',
            accessor: 'outTimes',
            render: (record) => (
                <div className="flex flex-col justify-center py-1">
                    {record.outTimes.map((outPunch, index) => (
                        <div
                            key={index}
                            className={`flex items-center py-0.5 ${outPunch.isMissed ? 'text-gray-500' : 'text-red-500'}`}
                        >
                            {outPunch.time !== '-' ? outPunch.time : ''} 
                            {outPunch.isMissed && outPunch.time !== '-' && (
                                <FaExclamationTriangle className="ml-2 text-orange-500" title="Missed Out Punch or Incomplete Pair" />
                            )}
                        </div>
                    ))}
                </div>
            )
        },
        {
            header: 'Duration',
            accessor: 'duration',
            render: (record) => <div className="flex items-center py-1">{record.duration || '00:00:00'}</div>
        }
    ];

    return (
        <div className="bg-transparent space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-[#0F172A]">Attendance Management</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Button 
                        onClick={() => setIsModalOpen(true)}
                        className="h-10 px-4 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800 border-none shadow-sm transition-all flex items-center gap-2"
                    >
                        <FaPlus size={10} /> Attendance
                    </Button>
                    <Button 
                        onClick={() => setIsFaceAttendanceOpen(true)}
                        className="h-10 px-4 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800 border-none shadow-sm transition-all flex items-center gap-2"
                    >
                        <FaCamera size={12} /> Face Attendance
                    </Button>
                    <Button 
                        onClick={downloadAttendanceCSV}
                        className="h-10 px-4 rounded-xl text-sm font-medium bg-black text-white hover:bg-zinc-800 border-none shadow-sm transition-all flex items-center gap-2"
                    >
                        <FaDownload size={12} /> Download
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <input
                            type="text"
                            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                            placeholder="Search by name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                            placeholder="Filter by RFID..."
                            value={filterRfid}
                            onChange={(e) => setFilterRfid(e.target.value)}
                        />
                        <input
                            type="text"
                            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                            placeholder="Filter by department..."
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        />
                        <input
                            type="date"
                            className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <Table
                            columns={columns.map(col => ({
                                ...col,
                                header: col.header.toUpperCase(),
                                headerAlign: 'text-left',
                                align: 'text-left'
                            }))}
                                                    data={processedAttendance}
                            loading={isLoading}
                            noDataMessage="No attendance records found"
                            striped={true}
                            hover={true}
                        />
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={loadMoreAttendance}
                                disabled={isFetchingMore}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isFetchingMore ? <Spinner size="sm" /> : 'Load More Records'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

                <Modal
                isOpen={isModalOpen}
                title="RFID Input & QR Scanner"
                size="md"
                onClose={() => {
                    setIsModalOpen(false);
                    setWorker({ rfid: '' });
                    setConfirmAction(null);
                }}
                >
                {confirmAction ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <h2 className="text-xl font-semibold mb-4">
                        Do you want to{' '}
                        <span
                            className={
                            confirmAction === 'Punch In'
                                ? 'text-green-600'
                                : 'text-red-600'
                        }
                    >
                        {confirmAction}
                    </span>
                        ?
                        </h2>
                        <div className="flex justify-center space-x-4">
                        <Button variant="secondary" onClick={handleCancel} disabled={isPunching}>
                            cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={isPunching}
                            className="flex items-center justify-center"
                        >
                            {isPunching ? <Spinner size="sm" /> : confirmAction}
                        </Button>
                        </div>
                    </div>
                      
                    ) : (
                        <form onSubmit={handleSubmit} className="mb-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={worker.rfid}
                            onChange={e => setWorker({ rfid: e.target.value })}
                            placeholder="RFID"
                            className="border p-2 mb-2 w-full"
                             list="rfid-suggestions"
                        />
                        <datalist id="rfid-suggestions">
                            {uniqueRfids.map((rfid, index) => (
                                <option key={index} value={rfid} />
                            ))}
                        </datalist>
                        <Button type="submit" variant="primary" className="w-full">
                            Submit
                        </Button>
                    </form>
                )}
            <Webcam
                ref={webcamRef}
                style={{ width: '100%', maxWidth: 400, margin: '0 auto', border: '1px solid #ddd' }}
                videoConstraints={{ facingMode: 'environment' }}
            />
            {qrText && (
                <div style={{ marginTop: 20 }}>
                <h1 className="text-lg text-center">RFID: {qrText}</h1>
                </div>
            )}
            </Modal>

            {/* Face Attendance Modal */}
            <FaceAttendance
                subdomain={subdomain}
                isOpen={isFaceAttendanceOpen}
                onClose={() => {
                    setIsFaceAttendanceOpen(false);
                }}
                onAttendanceMarked={refreshLatestAttendance} // Add this callback
            />
        </div>
    );
};

export default AttendanceManagement;

// Add the helper function for time conversion (same as backend)
function convertTo24Hour(time12h) {
    console.log("Converting time:", time12h);
    
    if (!time12h) {
        console.log("Time is null/undefined, returning 00:00:00");
        return '00:00:00';
    }
    
    // Handle different time formats
    if (typeof time12h === 'string' && time12h.includes(' ')) {
        const [time, modifier] = time12h.split(' ');
        console.log("Splitting time and modifier:", time, modifier);
        
        if (!time || !modifier) {
            console.log("Invalid time format, returning as is:", time12h);
            return time12h;
        }
        
        let [hours, minutes, seconds] = time.split(':');
        console.log("Split components:", hours, minutes, seconds);
        
        // Convert to numbers
        let hoursNum = parseInt(hours, 10);
        let minutesNum = parseInt(minutes, 10) || 0;
        let secondsNum = parseInt(seconds, 10) || 0;
        
        if (modifier === 'PM' && hoursNum !== 12) {
            hoursNum += 12;
        }
        if (modifier === 'AM' && hoursNum === 12) {
            hoursNum = 0;
        }
        
        const result = `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}:${secondsNum.toString().padStart(2, '0')}`;
        console.log("Converted to 24-hour format:", result);
        return result;
    }
    
    // If it's already in 24-hour format or unrecognized format, return as is
    console.log("Time already in 24-hour format or unrecognized, returning as is:", time12h);
    return time12h;
}