import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import Modal from '../common/Modal';
import appContext from '../../context/AppContext';
import { getTaskTopics, createTaskTopic, updateTaskTopic, deleteTaskTopic } from '../../services/taskTopicService';
import { getDepartments } from '../../services/departmentService';

const ManageTaskTopicsModal = ({ isOpen, onClose }) => {
  const { subdomain } = useContext(appContext);
  
  const [topics, setTopics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
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

  useEffect(() => {
    if (isOpen && subdomain) {
      fetchData();
    }
  }, [isOpen, subdomain]);

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
    if (!formData.points) return toast.error('Points are required');

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
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Topics" size="5xl" footer={null}>
      <div className="bg-slate-50/50 p-6 -m-6 rounded-b-3xl min-h-[500px]">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search topics..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="py-2.5 px-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => handleOpenAdd()}
            className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <FiPlus /> Add New Topic
          </button>
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
                    className="flex items-center justify-between w-full text-sm font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>Sub-topics ({(topic.subTopics || []).length})</span>
                    {expandedTopics[topic._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  
                  {expandedTopics[topic._id] && (
                    <div className="mt-3 pl-2 space-y-2">
                      {(topic.subTopics || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No sub-topics defined.</p>
                      ) : (
                        topic.subTopics.map((sub, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            {sub.title}
                          </div>
                        ))
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

      {/* Add/Edit Modal (Nested logically, implemented as absolute or simple div overlay to avoid nesting Modal components if needed, but we can use another Modal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800">{editingTopicId ? 'Edit Topic' : 'Add New Topic'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors">
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
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                className="px-5 py-2.5 bg-white border border-emerald-600 text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {editingTopicId ? 'Update Topic' : 'Add Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ManageTaskTopicsModal;
