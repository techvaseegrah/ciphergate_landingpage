import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiX, FiClock, FiLock, FiAlertCircle } from 'react-icons/fi';
import appContext from '../../context/AppContext';
import { getTaskTopics, createTaskTopic, updateTaskTopic, deleteTaskTopic } from '../../services/taskTopicService';
import { getDepartments } from '../../services/departmentService';
import TaskHistoryModal from './TaskHistoryModal';
import { useAuth } from '../../hooks/useAuth';
import PricingModal from '../common/PricingModal';

const ManageTaskTopicsPage = () => {
  const { subdomain } = useContext(appContext);
  const { user } = useAuth();
  const isPremium = user?.accountType === 'premium';
  
  const [topics, setTopics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  // Topic Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [formData, setFormData] = useState({
    topicName: '',
    points: '',
    department: '',
    isAllDepartments: true
  });
  
  const [expandedTopics, setExpandedTopics] = useState({});
  const [addingSubTopicFor, setAddingSubTopicFor] = useState(null);
  const [newSubTopics, setNewSubTopics] = useState({});


  useEffect(() => {
    if (subdomain) {
      if (isPremium) {
        fetchData();
      } else {
        // Just mock some data to show behind the blur
        setTopics([
          { _id: '1', topicName: 'Design high-fidelity user personas', points: 5, department: { name: 'Design' } },
          { _id: '2', topicName: 'Optimize SQL database indices', points: 3, department: { name: 'Engineering' } }
        ]);
      }
    }
  }, [subdomain, isPremium]);

  useEffect(() => {
    if (!isPremium) {
      const mainEl = document.querySelector('main');
      const prevMain = mainEl ? mainEl.style.overflow : null;
      const prevBody = document.body.style.overflow;

      if (mainEl) mainEl.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        if (mainEl) mainEl.style.overflow = prevMain;
        document.body.style.overflow = prevBody;
      };
    }
  }, [isPremium]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [topicsRes, deptsRes] = await Promise.all([
        getTaskTopics(subdomain),
        getDepartments({ subdomain })
      ]);
      setTopics(topicsRes || []);
      setDepartments(deptsRes || []);
    } catch (err) {
      toast.error('Failed to load topics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = (topic = null) => {
    if (topic) {
      setEditingTopicId(topic._id);
      setFormData({
        topicName: topic.topicName,
        points: topic.points,
        department: topic.department?._id || '',
        isAllDepartments: topic.isAllDepartments
      });
    } else {
      setEditingTopicId(null);
      setFormData({
        topicName: '',
        points: '',
        department: '',
        isAllDepartments: true
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.topicName.trim()) return toast.error('Topic Name is required');

    try {
      const payload = {
        ...formData,
        subdomain,
        isAllDepartments: !formData.department || formData.department === 'All'
      };

      if (editingTopicId) {
        const updated = await updateTaskTopic(editingTopicId, payload);
        setTopics(prev => prev.map(t => t._id === editingTopicId ? updated : t));
        toast.success('Topic updated');
      } else {
        const created = await createTaskTopic(payload);
        setTopics(prev => [created, ...prev]);
        toast.success('Topic added');
      }
      setIsAddModalOpen(false);
    } catch (err) {
      toast.error('Error saving topic');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this topic?')) {
      try {
        await deleteTaskTopic(id);
        setTopics(prev => prev.filter(t => t._id !== id));
        toast.success('Topic deleted');
      } catch (err) {
        toast.error('Error deleting topic');
      }
    }
  };

  const submitNewSubTopic = async (topic) => {
    const title = newSubTopics[topic._id];
    if (!title || !title.trim()) return setAddingSubTopicFor(null);
    
    try {
      const updatedSubTopics = [...(topic.subTopics || []), { title: title.trim() }];
      const payload = { 
        topicName: topic.topicName,
        points: topic.points,
        isAllDepartments: topic.isAllDepartments,
        department: topic.department?._id || null,
        subTopics: updatedSubTopics
      };
      
      const updated = await updateTaskTopic(topic._id, payload);
      setTopics(prev => prev.map(t => t._id === topic._id ? updated : t));
      setNewSubTopics(prev => ({ ...prev, [topic._id]: '' }));
      setAddingSubTopicFor(null);
      toast.success('Sub-topic added');
    } catch (err) {
      toast.error('Error adding sub-topic');
    }
  };

  const handleDeleteSubTopic = async (topic, idx) => {
    try {
      const updatedSubTopics = (topic.subTopics || []).filter((_, i) => i !== idx);
      const payload = { 
        topicName: topic.topicName,
        points: topic.points,
        isAllDepartments: topic.isAllDepartments,
        department: topic.department?._id || null,
        subTopics: updatedSubTopics
      };
      
      const updated = await updateTaskTopic(topic._id, payload);
      setTopics(prev => prev.map(t => t._id === topic._id ? updated : t));
      toast.success('Sub-topic removed');
    } catch (err) {
      toast.error('Error removing sub-topic');
    }
  };

  const toggleExpand = (id) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTopics = topics.filter(t => {
    if (search && !t.topicName.toLowerCase().includes(search.toLowerCase())) return false;
    if (deptFilter !== 'All') {
      if (deptFilter === 'All Departments' && !t.isAllDepartments) return false;
      if (deptFilter !== 'All Departments' && t.department?._id !== deptFilter) return false;
    }
    return true;
  });

  return (
    <div className={`p-4 md:p-8 font-poppins relative ${!isPremium ? 'min-h-screen bg-[#f8fafc] overflow-hidden' : 'min-h-screen bg-[#f8fafc]'}`}>
      <div className="relative">
      <div className={`bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px] ${!isPremium ? 'filter blur-[4px] select-none pointer-events-none opacity-40' : ''}`}>
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-extrabold text-slate-800 m-0">Manage Topics</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              <FiClock /> History
            </button>
            <button 
              onClick={() => handleOpenAdd()}
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
            >
              <FiPlus /> Add New Topic
            </button>
          </div>
        </div>

        {/* Grid of Topics */}
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading topics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map(topic => (
              <div key={topic._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer" />
                    <h4 className="font-bold text-slate-800 text-base leading-snug">{topic.topicName}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenAdd(topic)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <FiEdit size={14} />
                    </button>
                    <button onClick={() => handleDelete(topic._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="pl-7 mb-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Department: {topic.isAllDepartments ? 'All Departments' : topic.department?.name || 'N/A'} | Points: <span className="font-bold">{topic.points}</span>
                  </p>
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => toggleExpand(topic._id)}
                    className="flex items-center justify-between w-full text-sm font-bold text-blue-600 hover:text-blue-800 border-0 bg-transparent cursor-pointer p-0"
                  >
                    <span>Sub-topics ({(topic.subTopics || []).length})</span>
                    {expandedTopics[topic._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {expandedTopics[topic._id] && (
                    <div className="mt-3 pl-2 space-y-2">
                      {(topic.subTopics || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No sub-topics defined for this topic.</p>
                      ) : (
                        topic.subTopics.map((sub, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between">
                            <span>{sub.title}</span>
                            <button onClick={() => handleDeleteSubTopic(topic, idx)} className="text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer p-0 ml-2">
                              <FiX size={14} />
                            </button>
                          </div>
                        ))
                      )}

                      {addingSubTopicFor === topic._id ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-2">
                          <input 
                            type="text" 
                            autoFocus
                            value={newSubTopics[topic._id] || ''}
                            onChange={(e) => setNewSubTopics(prev => ({...prev, [topic._id]: e.target.value}))}
                            onKeyDown={(e) => e.key === 'Enter' && submitNewSubTopic(topic)}
                            placeholder="Enter sub-topic..."
                            className="w-full flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => submitNewSubTopic(topic)} className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-700 border-none">Save</button>
                            <button onClick={() => setAddingSubTopicFor(null)} className="flex-1 bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-200 border-none">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAddingSubTopicFor(topic._id)}
                          className="w-full mt-3 py-2.5 bg-[#0fa388] hover:bg-[#0d8a73] text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer border-0 flex items-center justify-center gap-2"
                        >
                          <FiPlus size={16} /> Add Sub-Topic
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredTopics.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                No topics found. Create your first topic!
              </div>
            )}
          </div>
        )}
      </div>

      {!isPremium && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-100/10">
          <div className="max-w-xl w-full text-center p-8 md:p-12 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-8 transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <FiLock size={36} />
            </div>

            <span className="px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs uppercase tracking-widest inline-block mb-4">
              Pro Feature Locked
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4 font-poppins">
              Manage Task Topics
            </h2>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto font-light">
              Unlock the ability to create dynamic task topics, assign points, and manage employee workflows across different departments seamlessly.
            </p>

            {user?.role === 'admin' ? (
              <button
                onClick={() => setShowPricingModal(true)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wider text-sm cursor-pointer border-0 font-poppins"
              >
                Upgrade to Premium Plan
              </button>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-3 text-left">
                <FiAlertCircle size={24} className="flex-shrink-0 text-amber-600" />
                <span>This advanced module requires a Premium Plan. Please request your administrator to upgrade your organization's subscription.</span>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 m-0">{editingTopicId ? 'Edit Topic' : 'Add New Topic'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 border-0 cursor-pointer text-slate-500 rounded-full flex items-center justify-center transition-colors">
                <FiX />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Topic Name</label>
                <input 
                  type="text" 
                  value={formData.topicName}
                  onChange={e => setFormData({ ...formData, topicName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Points</label>
                <input 
                  type="number" 
                  value={formData.points}
                  onChange={e => setFormData({ ...formData, points: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                <select 
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Department (All)</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-emerald-600 cursor-pointer text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 text-white cursor-pointer border-0 font-bold rounded-xl text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {editingTopicId ? 'Update Topic' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task History Modal */}
      <TaskHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
};

export default ManageTaskTopicsPage;
