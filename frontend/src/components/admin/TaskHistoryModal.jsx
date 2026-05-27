import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../common/Spinner';
import { format } from 'date-fns';

const TaskHistoryModal = ({ isOpen, onClose }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('workers/all-activities');
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      {/* Main History Modal */}
      <div className={`bg-white rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[80vh] ${selectedTask ? 'hidden' : ''} animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800 m-0 text-lg">Employee Task History</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border-0 cursor-pointer text-slate-500 rounded-full flex items-center justify-center transition-colors">
            <FiX />
          </button>
        </div>
        
        <div className="p-0 overflow-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
              No task history found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Department</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Points</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Topics</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(record => {
                  // In case the worker is not populated correctly
                  const dept = record.worker?.department?.name || record.worker?.department || 'N/A';
                  return (
                    <tr key={record._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-6 text-sm text-slate-600 font-medium whitespace-nowrap align-middle">{dept}</td>
                      <td className="py-6 px-6 text-sm text-slate-600 font-bold text-center align-middle">{record.points || 0}</td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex flex-col gap-2 max-w-lg mx-auto">
                          {record.topics?.map((t, idx) => (
                            <div key={idx} className="bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold px-4 py-2 rounded-lg text-center w-full shadow-sm">
                              {t.topicName || t.name} ({t.points || 0} pts)
                            </div>
                          ))}
                          {!record.topics?.length && <div className="text-center text-xs text-slate-400">No topics</div>}
                        </div>
                      </td>
                      <td className="py-6 px-6 text-xs text-slate-500 font-medium whitespace-nowrap align-middle">
                        {record.createdAt ? format(new Date(record.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <button 
                          onClick={() => setSelectedTask(record)}
                          className="bg-[#0fa388] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0d8a73] border-none cursor-pointer shadow-sm shadow-emerald-600/20 whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Task Details Sub-Modal */}
      {selectedTask && (
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0">
            <h3 className="font-extrabold text-slate-800 m-0 text-base">Task Details</h3>
            <button onClick={() => setSelectedTask(null)} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border-0 cursor-pointer text-slate-500 rounded-full flex items-center justify-center transition-colors">
              <FiX />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Employee</p>
                <p className="text-sm font-bold text-slate-800">{selectedTask.worker?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Department</p>
                <p className="text-sm font-bold text-slate-800">{selectedTask.worker?.department?.name || selectedTask.worker?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Points</p>
                <p className="text-sm font-bold text-slate-800">{selectedTask.points || 0}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-bold text-slate-800">{selectedTask.createdAt ? format(new Date(selectedTask.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">Topics & Selected Sub-topics</p>
              <div className="space-y-3">
                {selectedTask.topics?.map((t, idx) => (
                  <div key={idx} className="border border-blue-100 rounded-xl p-4 bg-white shadow-sm">
                    <p className="text-sm font-bold text-blue-800 mb-1">{t.topicName || t.name} ({t.points || 0} pts)</p>
                    <p className="text-[11px] text-slate-400 italic">No sub-topics for this entry.</p>
                  </div>
                ))}
                {!selectedTask.topics?.length && <p className="text-sm text-slate-500 italic">No topics selected</p>}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Task Data</p>
              <p className="text-xs text-slate-500">{selectedTask.description || 'No task data available'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHistoryModal;
