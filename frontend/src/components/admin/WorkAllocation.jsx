import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiBell, FiBarChart2, FiTrash2, FiCheckCircle,
  FiClock, FiUser, FiUsers, FiLayers, FiChevronDown, FiCheck, FiX, FiLock, FiAlertCircle,
  FiCheckSquare, FiCalendar, FiZap, FiTag, FiFlag, FiBookmark, FiMessageSquare
} from 'react-icons/fi';
import {
  getTasks, createTask, updateTask, deleteTask, getOverview
} from '../../services/workAllocationService';
import { getDepartments } from '../../services/departmentService';
import { getWorkers } from '../../services/workerService';
import { useAuth } from '../../hooks/useAuth';
import appContext from '../../context/AppContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import PricingModal from '../common/PricingModal';

const WorkAllocation = ({ isWorkerView = false }) => {
  const { user } = useAuth();
  const { subdomain } = useContext(appContext);

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);

  // Search & Filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('All');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('All');
  const [showDeletedOnly, setShowDeletedOnly] = useState(false);

  // Modal states
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewData, setOverviewData] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Form state for New Workspace / Task
  const [taskForm, setTaskForm] = useState({
    title: '',
    workspace: 'Untitled Workspace...',
    subtasks: [],
    startDate: '',
    endDate: '',
    priority: 'medium',
    phase: 'to_do',
    assignType: 'individual',
    assignedWorkers: [],
    assignedTeam: '',
    workType: 'task',
    reviewNotes: '',
    progress: 0
  });
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Drag-and-drop state
  const dragTaskId = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // which column is hovered

  // Check if premium
  const isPremium = user?.accountType === 'premium';

  const loadInitialData = async () => {
    if (!subdomain) return;
    setIsLoading(true);
    try {
      if (isPremium) {
        const [tasksRes, deptsRes, workersRes, overviewRes] = await Promise.all([
          getTasks(),
          getDepartments({ subdomain }),
          getWorkers({ subdomain }),
          getOverview()
        ]);
        setTasks(tasksRes || []);
        setDepartments(deptsRes || []);
        setWorkers(workersRes || []);
        setOverviewData(overviewRes || []);
      } else {
        // Set mock data for free plan preview so they can see work allocation details clearly
        setTasks([
          {
            _id: 'mock-1',
            title: 'Design high-fidelity user personas & journey maps',
            workspace: 'Design System',
            progress: 30,
            phase: 'to_do',
            taskNumber: 'TSK-1024',
            priority: 'high',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignedWorkers: [{ name: 'Alex Rivera' }]
          },
          {
            _id: 'mock-2',
            title: 'Implement OAuth2 login flows and JWT authentication middleware',
            workspace: 'Security Suite',
            progress: 60,
            phase: 'in_progress',
            taskNumber: 'TSK-1025',
            priority: 'high',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            assignedWorkers: [{ name: 'Sarah Jenkins' }]
          },
          {
            _id: 'mock-3',
            title: 'Setup automated CI/CD pipelines & GitHub actions',
            workspace: 'DevOps Lifecycle',
            progress: 90,
            phase: 'review',
            taskNumber: 'TSK-1026',
            priority: 'medium',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            assignedWorkers: [{ name: 'Michael Chen' }]
          },
          {
            _id: 'mock-4',
            title: 'Optimize SQL database indices and cache frequently accessed endpoints',
            workspace: 'Database Tuning',
            progress: 100,
            phase: 'done',
            taskNumber: 'TSK-1027',
            priority: 'low',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            assignedWorkers: [{ name: 'Emma Watson' }]
          }
        ]);
        setWorkers([
          { _id: 'w1', name: 'Alex Rivera' },
          { _id: 'w2', name: 'Sarah Jenkins' },
          { _id: 'w3', name: 'Michael Chen' },
          { _id: 'w4', name: 'Emma Watson' }
        ]);
        setDepartments([
          { _id: 'd1', name: 'Design Team' },
          { _id: 'd2', name: 'Security Team' },
          { _id: 'd3', name: 'DevOps Team' }
        ]);
        setOverviewData([
          { name: 'Design Team', to_do: 1, in_progress: 0, review: 0, done: 0, total: 1 },
          { name: 'Security Team', to_do: 0, in_progress: 1, review: 0, done: 0, total: 1 },
          { name: 'DevOps Team', to_do: 0, in_progress: 0, review: 1, done: 0, total: 1 },
          { name: 'Database Team', to_do: 0, in_progress: 0, review: 0, done: 1, total: 1 }
        ]);
      }
    } catch (error) {
      console.error('Error loading work allocation data:', error);
      toast.error('Failed to load work allocation data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [subdomain, isPremium]);

  // Hide scrollbars for free-plan users on this page only.
  // Covers AdminLayout (<main> scroll) AND WorkerLayout (body scroll).
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

  const handleOpenNewTaskModal = (taskToEdit = null) => {
    if (taskToEdit) {
      setEditingTaskId(taskToEdit._id);
      setTaskForm({
        title: taskToEdit.title || '',
        workspace: taskToEdit.workspace || 'Untitled Workspace...',
        subtasks: taskToEdit.subtasks || [],
        startDate: taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '',
        endDate: taskToEdit.endDate ? new Date(taskToEdit.endDate).toISOString().split('T')[0] : '',
        priority: taskToEdit.priority || 'medium',
        phase: taskToEdit.phase || 'to_do',
        assignType: taskToEdit.assignType || 'individual',
        assignedWorkers: taskToEdit.assignedWorkers ? taskToEdit.assignedWorkers.map(w => w._id || w) : [],
        assignedTeam: taskToEdit.assignedTeam ? taskToEdit.assignedTeam._id || taskToEdit.assignedTeam : '',
        workType: taskToEdit.workType || 'task',
        reviewNotes: taskToEdit.reviewNotes || '',
        progress: taskToEdit.progress || 0
      });
    } else {
      setEditingTaskId(null);
      setTaskForm({
        title: '',
        workspace: 'Untitled Workspace...',
        subtasks: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        phase: 'to_do',
        assignType: 'individual',
        assignedWorkers: [],
        assignedTeam: '',
        workType: 'task',
        reviewNotes: '',
        progress: 0
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setTaskForm(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtaskInput.trim(), completed: false }]
    }));
    setNewSubtaskInput('');
  };

  const handleToggleSubtask = (index) => {
    setTaskForm(prev => {
      const updated = [...prev.subtasks];
      updated[index].completed = !updated[index].completed;
      return { ...prev, subtasks: updated };
    });
  };

  const handleDeleteSubtask = (index) => {
    setTaskForm(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      if (editingTaskId) {
        const updated = await updateTask(editingTaskId, taskForm);
        setTasks(prev => prev.map(t => t._id === editingTaskId ? updated : t));
        toast.success('Task updated successfully');
      } else {
        const created = await createTask(taskForm);
        setTasks(prev => [created, ...prev]);
        toast.success('Workspace task created successfully');
      }
      setIsTaskModalOpen(false);
      // Refresh overview
      const overviewRes = await getOverview();
      setOverviewData(overviewRes || []);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.message || 'Failed to save task');
    }
  };

  const handleMovePhase = async (taskId, newPhase, newProgress = null) => {
    try {
      const currentTask = tasks.find(t => t._id === taskId);
      if (!currentTask) return;

      const payload = { phase: newPhase };
      if (newProgress !== null) {
        payload.progress = newProgress;
      } else if (newPhase === 'done') {
        payload.progress = 100;
      } else if (newPhase === 'to_do') {
        payload.progress = 0;
      }

      const updated = await updateTask(taskId, payload);
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
      toast.success(`Task moved to ${newPhase.replace('_', ' ').toUpperCase()}`);

      const overviewRes = await getOverview();
      setOverviewData(overviewRes || []);
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    }
  };

  const handleDeleteTaskClick = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('Task deleted');
        const overviewRes = await getOverview();
        setOverviewData(overviewRes || []);
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  // Toggle a subtask checkbox directly on the card (employee side persists to backend)
  const handleToggleSubtaskOnCard = async (taskId, subtaskIndex, e) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => {
      if (t._id !== taskId) return t;
      const updatedSubtasks = (t.subtasks || []).map((s, i) =>
        i === subtaskIndex ? { ...s, completed: !s.completed } : s
      );
      const completedCount = updatedSubtasks.filter(s => s.completed).length;
      const newProgress = updatedSubtasks.length > 0
        ? Math.round((completedCount / updatedSubtasks.length) * 100)
        : t.progress;
      return { ...t, subtasks: updatedSubtasks, progress: newProgress };
    }));
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      const updatedSubtasks = (task.subtasks || []).map((s, i) =>
        i === subtaskIndex ? { ...s, completed: !s.completed } : s
      );
      const completedCount = updatedSubtasks.filter(s => s.completed).length;
      const newProgress = updatedSubtasks.length > 0
        ? Math.round((completedCount / updatedSubtasks.length) * 100)
        : task.progress;
      await updateTask(taskId, { subtasks: updatedSubtasks, progress: newProgress });
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (isWorkerView) {
      const isAssignedToMe = task.assignedWorkers?.some(w => (w._id === user?._id || w === user?._id));
      const isAssignedToMyTeam = task.assignedTeam && (task.assignedTeam._id === user?.department || task.assignedTeam === user?.department);
      if (!isAssignedToMe && !isAssignedToMyTeam) return false;
    }

    if (globalSearch && !task.title.toLowerCase().includes(globalSearch.toLowerCase())) {
      return false;
    }
    if (taskSearch && !task.title.toLowerCase().includes(taskSearch.toLowerCase()) && !task.taskNumber?.toLowerCase().includes(taskSearch.toLowerCase())) {
      return false;
    }
    if (selectedEmployeeFilter !== 'All') {
      const isAssigned = task.assignedWorkers?.some(w => w._id === selectedEmployeeFilter || w.name === selectedEmployeeFilter);
      if (!isAssigned) return false;
    }
    if (selectedTeamFilter !== 'All') {
      if (task.assignedTeam?._id !== selectedTeamFilter && task.assignedTeam?.name !== selectedTeamFilter) return false;
    }
    if (selectedPriorityFilter !== 'All') {
      if (task.priority !== selectedPriorityFilter.toLowerCase()) return false;
    }
    return true;
  });

  // Columns breakdown
  const todoTasks = filteredTasks.filter(t => t.phase === 'to_do');
  const inProgressTasks = filteredTasks.filter(t => t.phase === 'in_progress');
  const reviewTasks = filteredTasks.filter(t => t.phase === 'review');
  const doneTasks = filteredTasks.filter(t => t.phase === 'done');

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, taskId) => {
    dragTaskId.current = taskId;
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    dragTaskId.current = null;
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const handleColumnDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleColumnDragEnter = useCallback((phase) => {
    setDropTarget(phase);
  }, []);

  const handleColumnDragLeave = useCallback((e) => {
    // Only clear when truly leaving the column (not entering a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  }, []);

  const handleColumnDrop = useCallback((e, targetPhase) => {
    e.preventDefault();
    const id = dragTaskId.current;
    if (!id) return;
    const task = tasks.find(t => t._id === id);
    if (!task || task.phase === targetPhase) {
      setDropTarget(null);
      return;
    }
    // Pick sensible default progress when dropping into a phase
    const progressMap = { to_do: 0, in_progress: 50, review: 90, done: 100 };
    handleMovePhase(id, targetPhase, progressMap[targetPhase]);
    setDropTarget(null);
  }, [tasks, handleMovePhase]);

  return (
    <div className={`work-allocation-container flex flex-col font-poppins relative ${!isPremium ? 'min-h-screen bg-[#f8fafc] p-4 md:p-8 overflow-hidden' : 'min-h-screen bg-[#f8fafc] p-4 md:p-8'}`}>
      {/* Top Header Bar — hidden for free plan */}
      {isPremium && <div className="bg-white rounded-2xl p-4 md:px-8 md:py-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 self-start md:self-center">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          <h1 className="text-xl md:text-2xl font-extrabold text-emerald-700 uppercase tracking-widest m-0">
            WORK ALLOCATION
          </h1>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Search employees, tasks, reports..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {!isWorkerView && (
            <button
              onClick={() => handleOpenNewTaskModal()}
              className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm cursor-pointer flex-shrink-0"
            >
              <FiPlus size={22} />
            </button>
          )}

          <div className="relative flex-shrink-0">
            <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm cursor-pointer">
              <FiBell size={20} />
            </button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 flex-shrink-0">
            <img
              src={user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || 'User')}&background=0f172a&color=ffffff&bold=true`}
              alt="Avatar"
              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none mb-1 capitalize">{user?.name || user?.username || 'Admin'}</p>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 m-0">{user?.role || 'ADMIN'}</p>
            </div>
          </div>
        </div>
      </div>}

      {/* Main Board Content wrapper (Relative for lock overlay if free plan) */}
      <div className="relative flex-1 flex flex-col">
        {/* Main interactive sections wrapper, blurred/pointer-events-none if free plan */}
        <div className={`flex-1 flex flex-col ${!isPremium ? 'filter blur-[4px] select-none pointer-events-none opacity-40' : ''}`}>
          {/* Sub-bar Actions & Filters */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 mb-8 space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WORKSPACE CONTROLS</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOverviewOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              <FiBarChart2 size={16} className="text-slate-500" />
              <span>Dashboard</span>
            </button>

            {!isWorkerView && (
              <button
                onClick={() => handleOpenNewTaskModal()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 cursor-pointer border-0"
              >
                <FiPlus size={16} />
                <span>New Task</span>
              </button>
            )}

          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>



          <div className="relative">
            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 appearance-none transition-all cursor-pointer"
            >
              <option value="All">Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start pb-12">
          {/* TO DO COLUMN */}
          <div
            className={`kanban-column bg-slate-100/80 rounded-3xl p-4 border shadow-sm flex flex-col gap-4 transition-all duration-200 ${
              dropTarget === 'to_do'
                ? 'border-slate-500 bg-slate-200/70 ring-2 ring-slate-400/40'
                : 'border-slate-200/80'
            }`}
            onDragOver={handleColumnDragOver}
            onDragEnter={() => handleColumnDragEnter('to_do')}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, 'to_do')}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider m-0">To Do</h3>
                <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold">{todoTasks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[400px]">
              {todoTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleOpenNewTaskModal(task)}
                  className={`kanban-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-4 relative group select-none ${
                    draggingId === task._id ? 'opacity-40 scale-95 rotate-1' : ''
                  }`}
                >
                  {!isWorkerView && (
                    <button
                      onClick={(e) => handleDeleteTaskClick(task._id, e)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-slate-50 p-1.5 rounded-lg border-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full w-max text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <FiClock size={12} />
                    <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug m-0 pr-6">
                    {task.title}
                  </p>

                  {/* ── Task Checklist inside card ── */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <FiCheckSquare size={12} className="text-slate-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Task Checklist</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase rounded-full">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Done
                        </span>
                      </div>
                      {task.subtasks.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={(e) => handleToggleSubtaskOnCard(task._id, i, e)}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sub.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {sub.completed && <FiCheck size={9} />}
                          </div>
                          <span className={`text-[11px] font-semibold leading-tight flex-1 transition-all ${
                            sub.completed ? 'line-through text-slate-300' : 'text-slate-600'
                          }`}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <span>PROGRESS</span>
                      <span className="text-slate-700">{task.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'in_progress', 10); }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer border-0 uppercase tracking-wider"
                    >
                      MOVE NEXT
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="text-slate-300" size={14} />
                      <span>TASK — {task.taskNumber}</span>
                    </div>
                    {task.assignedWorkers?.length > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px]">
                        <FiUser size={10} />
                        <span className="truncate max-w-[100px]">{task.assignedWorkers[0].name}</span>
                        {task.assignedWorkers.length > 1 && <span>+{task.assignedWorkers.length - 1}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {todoTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 text-slate-400 text-xs">
                  <span>No tasks in To Do</span>
                </div>
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div
            className={`kanban-column bg-blue-50/60 rounded-3xl p-4 border shadow-sm flex flex-col gap-4 transition-all duration-200 ${
              dropTarget === 'in_progress'
                ? 'border-blue-500 bg-blue-100/60 ring-2 ring-blue-400/40'
                : 'border-blue-100/60'
            }`}
            onDragOver={handleColumnDragOver}
            onDragEnter={() => handleColumnDragEnter('in_progress')}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, 'in_progress')}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider m-0">In Progress</h3>
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">{inProgressTasks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[400px]">
              {inProgressTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleOpenNewTaskModal(task)}
                  className={`kanban-card bg-white rounded-2xl p-5 border border-blue-100/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-4 relative group select-none ${
                    draggingId === task._id ? 'opacity-40 scale-95 rotate-1' : ''
                  }`}
                >
                  {!isWorkerView && (
                    <button
                      onClick={(e) => handleDeleteTaskClick(task._id, e)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-slate-50 p-1.5 rounded-lg border-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full w-max text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    <FiClock size={12} />
                    <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug m-0 pr-6">
                    {task.title}
                  </p>

                  {/* ── Task Checklist inside card ── */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <FiCheckSquare size={12} className="text-slate-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Task Checklist</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase rounded-full">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Done
                        </span>
                      </div>
                      {task.subtasks.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={(e) => handleToggleSubtaskOnCard(task._id, i, e)}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sub.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {sub.completed && <FiCheck size={9} />}
                          </div>
                          <span className={`text-[11px] font-semibold leading-tight flex-1 transition-all ${
                            sub.completed ? 'line-through text-slate-300' : 'text-slate-600'
                          }`}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <span>PROGRESS</span>
                      <span className="text-blue-600">{task.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'to_do', 0); }}
                      className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                    >
                      MOVE BACK
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'review', 90); }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer border-0 uppercase tracking-wider"
                    >
                      MOVE NEXT
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="text-blue-500" size={14} />
                      <span>TASK — {task.taskNumber}</span>
                    </div>
                    {task.assignedWorkers?.length > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px]">
                        <FiUser size={10} />
                        <span className="truncate max-w-[100px]">{task.assignedWorkers[0].name}</span>
                        {task.assignedWorkers.length > 1 && <span>+{task.assignedWorkers.length - 1}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {inProgressTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-2xl p-8 text-blue-400 text-xs">
                  <span>No tasks in In Progress</span>
                </div>
              )}
            </div>
          </div>

          {/* REVIEW COLUMN */}
          <div
            className={`kanban-column bg-purple-50/60 rounded-3xl p-4 border shadow-sm flex flex-col gap-4 transition-all duration-200 ${
              dropTarget === 'review'
                ? 'border-purple-500 bg-purple-100/60 ring-2 ring-purple-400/40'
                : 'border-purple-100/60'
            }`}
            onDragOver={handleColumnDragOver}
            onDragEnter={() => handleColumnDragEnter('review')}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, 'review')}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 className="text-sm font-extrabold text-purple-900 uppercase tracking-wider m-0">Review</h3>
                <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">{reviewTasks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[400px]">
              {reviewTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleOpenNewTaskModal(task)}
                  className={`kanban-card bg-white rounded-2xl p-5 border-l-4 border-l-purple-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col gap-4 relative group select-none ${
                    draggingId === task._id ? 'opacity-40 scale-95 rotate-1' : ''
                  }`}
                >
                  {!isWorkerView && (
                    <button
                      onClick={(e) => handleDeleteTaskClick(task._id, e)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-slate-50 p-1.5 rounded-lg border-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full w-max text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                      <FiClock size={12} />
                      <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Testing</span>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug m-0 pr-6">
                    {task.title}
                  </p>

                  {/* ── Task Checklist inside card ── */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <FiCheckSquare size={12} className="text-slate-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Task Checklist</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase rounded-full">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Done
                        </span>
                      </div>
                      {task.subtasks.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={(e) => handleToggleSubtaskOnCard(task._id, i, e)}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sub.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {sub.completed && <FiCheck size={9} />}
                          </div>
                          <span className={`text-[11px] font-semibold leading-tight flex-1 transition-all ${
                            sub.completed ? 'line-through text-slate-300' : 'text-slate-600'
                          }`}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <span>PROGRESS</span>
                      <span className="text-purple-600">{task.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'done', 100); }}
                      className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 uppercase tracking-wider"
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'in_progress', 50); }}
                      className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer border-0 uppercase tracking-wider"
                    >
                      REJECT
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="text-purple-500" size={14} />
                      <span>TASK — {task.taskNumber}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px]">
                      <FiCheck size={10} />
                      <span>Testing fine!</span>
                    </div>
                  </div>
                </div>
              ))}
              {reviewTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-2xl p-8 text-purple-400 text-xs">
                  <span>No tasks in Review</span>
                </div>
              )}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div
            className={`kanban-column bg-emerald-50/60 rounded-3xl p-4 border shadow-sm flex flex-col gap-4 transition-all duration-200 ${
              dropTarget === 'done'
                ? 'border-emerald-500 bg-emerald-100/60 ring-2 ring-emerald-400/40'
                : 'border-emerald-100/60'
            }`}
            onDragOver={handleColumnDragOver}
            onDragEnter={() => handleColumnDragEnter('done')}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, 'done')}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider m-0">Done</h3>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">{doneTasks.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[400px]">
              {doneTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleOpenNewTaskModal(task)}
                  className={`kanban-card bg-white rounded-2xl p-5 border border-emerald-100/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-4 relative group select-none ${
                    draggingId === task._id ? 'opacity-40 scale-95 rotate-1' : ''
                  }`}
                >
                  {!isWorkerView && (
                    <button
                      onClick={(e) => handleDeleteTaskClick(task._id, e)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-slate-50 p-1.5 rounded-lg border-0"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full w-max text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    <FiClock size={12} />
                    <span>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug m-0 pr-6">
                    {task.title}
                  </p>

                  {/* ── Task Checklist inside card ── */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <FiCheckSquare size={12} className="text-slate-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Task Checklist</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-black uppercase rounded-full">
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Done
                        </span>
                      </div>
                      {task.subtasks.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={(e) => handleToggleSubtaskOnCard(task._id, i, e)}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            sub.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {sub.completed && <FiCheck size={9} />}
                          </div>
                          <span className={`text-[11px] font-semibold leading-tight flex-1 transition-all ${
                            sub.completed ? 'line-through text-slate-300' : 'text-slate-600'
                          }`}>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <span>PROGRESS</span>
                      <span className="text-emerald-600">100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMovePhase(task._id, 'review', 90); }}
                      className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                    >
                      MOVE BACK
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FiCheckCircle className="text-emerald-500" size={14} />
                      <span>TASK — {task.taskNumber}</span>
                    </div>
                    {task.assignedWorkers?.length > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px]">
                        <FiUser size={10} />
                        <span className="truncate max-w-[100px]">{task.assignedWorkers[0].name}</span>
                        {task.assignedWorkers.length > 1 && <span>+{task.assignedWorkers.length - 1}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-emerald-400 text-xs">
                  <span>No tasks in Done</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div> {/* Closes blurred wrapper */}

      {/* Lock Overlay (shown if free plan) */}
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
              Work Allocation & Kanban
            </h2>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto font-light">
              Unlock seamless task assignment, interactive Kanban boards, employee workload tracking, and real-time execution graphs. Boost your team's productivity to the absolute maximum.
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
      </div> {/* Closes relative wrapper */}

      {/* MODAL 2: Allocation Status Overview Modal */}
      <Modal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        title="Allocation Status Overview"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest m-0">
              TEAM-WISE PERFORMANCE
            </h3>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 text-left">DEPARTMENT / TEAM</th>
                    <th className="py-4 px-6 text-center">TO DO</th>
                    <th className="py-4 px-6 text-center">IN PROGRESS</th>
                    <th className="py-4 px-6 text-center">REVIEW</th>
                    <th className="py-4 px-6 text-center">DONE</th>
                    <th className="py-4 px-6 text-center text-emerald-600">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                  {overviewData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-900">{row.name}</td>
                      <td className="py-4 px-6 text-center text-blue-600">{row.to_do > 0 ? row.to_do : <span className="text-slate-300 font-normal">0</span>}</td>
                      <td className="py-4 px-6 text-center text-teal-600">{row.in_progress > 0 ? row.in_progress : <span className="text-slate-300 font-normal">0</span>}</td>
                      <td className="py-4 px-6 text-center text-purple-600">{row.review > 0 ? row.review : <span className="text-slate-300 font-normal">0</span>}</td>
                      <td className="py-4 px-6 text-center text-emerald-600 font-extrabold">{row.done > 0 ? row.done : <span className="text-slate-300 font-normal">0</span>}</td>
                      <td className="py-4 px-6 text-center text-emerald-700 font-black bg-emerald-50/30">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsOverviewOpen(false)}
              className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all cursor-pointer border-0 text-xs uppercase tracking-wider"
            >
              Close Overview
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: New Workspace / Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={isWorkerView ? "TASK DETAILS" : (editingTaskId ? "EDIT WORKSPACE TASK" : "NEW WORKSPACE")}
        size="3xl"
        footer={null}
        customHeader={
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-xs">
              <FiCheckSquare className="text-emerald-600 w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider font-poppins">{isWorkerView ? "TASK DETAILS" : (editingTaskId ? "EDIT WORKSPACE" : "NEW WORKSPACE")}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveTask}
                className="bg-[#5abcb0] hover:bg-[#4ea89d] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2 transition-all cursor-pointer border-none font-poppins tracking-wide"
              >
                <FiCheck className="w-4 h-4" /> {isWorkerView ? "Submit Progress" : (editingTaskId ? "Update Workspace" : "Create Workspace")}
              </button>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 w-10 h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer border-none"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        }
      >
        {/* 3-column grid matching the reference design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* ── COLUMN 1: Workspace Definition ── */}
          <div className="space-y-5 lg:pr-7 lg:border-r lg:border-slate-100">
            {/* Section label */}
            <div className="flex items-center gap-1.5">
              <FiLayers className="text-slate-400 w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-poppins">WORKSPACE DEFINITION</span>
            </div>

            {/* Title input */}
            <input
              type="text"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Untitled Workspace..."
              disabled={isWorkerView}
              className="w-full text-[22px] font-black text-slate-800 placeholder-slate-200 border-none focus:outline-none font-poppins bg-transparent p-0 leading-tight disabled:opacity-70 disabled:cursor-not-allowed"
            />

            {/* Task Checklist card */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-[20px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiCheckSquare className="text-slate-700 w-4 h-4" />
                  <span className="text-xs font-black text-slate-800 font-poppins">Task Checklist</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase rounded-full font-poppins">
                  {taskForm.subtasks.length} SUB-TASKS
                </span>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {taskForm.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(i)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 cursor-pointer ${sub.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 bg-white'}`}
                    >
                      {sub.completed && <FiCheck size={11} />}
                    </button>
                    <span className={`flex-1 text-xs font-semibold text-slate-700 font-poppins ${sub.completed ? 'line-through text-slate-300' : ''}`}>{sub.title}</span>
                    {!isWorkerView && (
                      <button type="button" onClick={() => handleDeleteSubtask(i)} className="text-amber-400 hover:text-amber-600 border-none bg-transparent cursor-pointer p-0">
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Inline add row */}
                {!isWorkerView && (
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-md border border-slate-200 bg-white flex-shrink-0" />
                    <input
                      type="text"
                      value={newSubtaskInput}
                      onChange={e => setNewSubtaskInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                      placeholder="Next sub-task..."
                      className="flex-1 text-xs text-slate-600 placeholder-slate-300 bg-transparent border-none focus:outline-none font-poppins p-0"
                    />
                    <button type="button" className="text-amber-400 border-none bg-transparent cursor-pointer p-0">
                      <FiX size={14} />
                    </button>
                  </div>
                )}
              </div>

              {!isWorkerView && (
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="w-full py-2.5 border border-dashed border-emerald-300 rounded-2xl text-emerald-600 bg-transparent hover:bg-emerald-50 text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer font-poppins"
                >
                  <FiPlus className="w-3.5 h-3.5" /> ADD NEXT POINT
                </button>
              )}
            </div>

            {/* Resource Timeline & Tags */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="text-slate-400 w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-poppins">RESOURCE TIMELINE & TAGS</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest font-poppins">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> ACTIVE
                </span>
              </div>

              <div className="bg-[#f8fafc] border border-slate-100 rounded-[20px] p-4 space-y-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <FiCalendar className="text-emerald-600 w-3 h-3" />
                  <span className="text-[10px] font-black uppercase text-slate-400 font-poppins">TIMELINE PERIOD</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-emerald-600 block mb-1 font-poppins">START</label>
                    <input
                      type="date"
                      value={taskForm.startDate}
                      onChange={e => setTaskForm({ ...taskForm, startDate: e.target.value })}
                      disabled={isWorkerView}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500 font-poppins cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <span className="text-slate-300 font-bold mt-4 text-sm flex-shrink-0">—</span>
                  <div className="flex-1">
                    <label className="text-[9px] font-black uppercase text-emerald-600 block mb-1 font-poppins">END</label>
                    <input
                      type="date"
                      value={taskForm.endDate}
                      onChange={e => setTaskForm({ ...taskForm, endDate: e.target.value })}
                      disabled={isWorkerView}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:border-emerald-500 font-poppins cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Matrix */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FiZap className="text-amber-500 w-3.5 h-3.5" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-poppins">PRIORITY MATRIX</span>
              </div>
              <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-full">
                {['low', 'medium', 'high'].map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => !isWorkerView && setTaskForm({ ...taskForm, priority: p })}
                    className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all border-0 font-poppins ${isWorkerView ? 'cursor-default' : 'cursor-pointer'} ${taskForm.priority === p ? 'bg-[#f57c00] text-white shadow-md' : 'text-slate-400 bg-transparent'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── COLUMN 2: Phase Status & Controls ── */}
          <div className="space-y-5 lg:px-7 lg:border-r lg:border-slate-100 mt-6 lg:mt-0">

            {/* Phase Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FiClock className="text-emerald-500 w-3.5 h-3.5" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-poppins">PHASE STATUS</span>
              </div>
              <div className="relative">
                <select
                  value={taskForm.phase}
                  onChange={e => setTaskForm({ ...taskForm, phase: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-800 uppercase focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer font-poppins tracking-wide"
                >
                  <option value="to_do">TO DO</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="review">REVIEW</option>
                  <option value="done">DONE</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Assign To */}
            {!isWorkerView && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-poppins">ASSIGN TO</label>
                <div className="flex p-1 bg-slate-100 rounded-full">
                  {['team', 'individual', 'both'].map(a => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setTaskForm({ ...taskForm, assignType: a })}
                      className={`flex-1 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0 font-poppins ${taskForm.assignType === a ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 bg-transparent'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Select Employees */}
            {!isWorkerView && (taskForm.assignType === 'individual' || taskForm.assignType === 'both') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-poppins">SELECT EMPLOYEES</label>
                <div className="relative">
                  <select
                    value={taskForm.assignedWorkers[0] || ''}
                    onChange={e => setTaskForm({ ...taskForm, assignedWorkers: [e.target.value] })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer font-poppins"
                  >
                    <option value="">Add employees...</option>
                    {workers.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
            )}

            {/* Select Team */}
            {!isWorkerView && (taskForm.assignType === 'team' || taskForm.assignType === 'both') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-poppins">SELECT TEAM</label>
                <div className="relative">
                  <select
                    value={taskForm.assignedTeam}
                    onChange={e => setTaskForm({ ...taskForm, assignedTeam: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer font-poppins"
                  >
                    <option value="">Select Department Team...</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
            )}

            {/* Work Type – 2×2 grid */}
            {!isWorkerView && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <FiTag className="text-emerald-500 w-3.5 h-3.5" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-poppins">WORK TYPE</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'task',  label: 'TASK',  Icon: FiCheckSquare, sel: 'border-emerald-500 bg-emerald-50/50', selIcon: 'text-emerald-500' },
                    { id: 'bug',   label: 'BUG',   Icon: FiAlertCircle, sel: 'border-rose-400   bg-rose-50/50',    selIcon: 'text-rose-500'   },
                    { id: 'story', label: 'STORY', Icon: FiBookmark,    sel: 'border-blue-400  bg-blue-50/50',    selIcon: 'text-blue-500'   },
                    { id: 'epic',  label: 'EPIC',  Icon: FiZap,         sel: 'border-purple-400 bg-purple-50/50', selIcon: 'text-purple-500' },
                  ].map(({ id, label, Icon, sel, selIcon }) => {
                    const active = taskForm.workType === id;
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setTaskForm({ ...taskForm, workType: id })}
                        className={`py-3 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer font-poppins border-2 ${active ? sel + ' text-slate-800' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                      >
                        <Icon className={`w-4 h-4 ${active ? selIcon : 'text-slate-400'}`} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resolution Feedback */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="res-check" className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer rounded" />
                <label htmlFor="res-check" className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-poppins cursor-pointer">
                  {isWorkerView ? 'SUBMISSION NOTES / LINKS' : 'RESOLUTION FEEDBACK'}
                </label>
              </div>
              <textarea
                value={taskForm.reviewNotes}
                onChange={e => setTaskForm({ ...taskForm, reviewNotes: e.target.value })}
                placeholder={isWorkerView ? 'Add your submission notes, links to work...' : 'Add review notes...'}
                rows={3}
                className="w-full p-3.5 bg-[#fff8ec] border border-amber-200/60 rounded-2xl text-xs text-slate-800 placeholder-amber-400/60 font-medium focus:outline-none focus:border-amber-400 transition-all font-poppins resize-none"
              />
            </div>
          </div>

          {/* ── COLUMN 3: Resource Execution Graph ── */}
          <div className="flex flex-col space-y-4 lg:pl-7 mt-6 lg:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-poppins">RESOURCE EXECUTION GRAPH</span>
            </div>

            <div className="flex-1 bg-[#f8fafc] border border-slate-200 rounded-3xl flex flex-col items-center justify-center min-h-[340px]">
              <FiUsers size={44} className="text-slate-300 mb-3" />
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest m-0 font-poppins">NO EXECUTION DATA</p>
            </div>
          </div>
        </div>
      </Modal>


      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
};

export default WorkAllocation;
