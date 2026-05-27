import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import TaskForm from './TaskForm';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../services/api';

const WorkerManageTopicsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showAllRecentTasks, setShowAllRecentTasks] = useState(false);

  useEffect(() => {
    const loadTaskData = async () => {
      setIsLoading(true);
      try {
        if (user?._id) {
          const response = await api.get(`/workers/${user._id}/activities`);
          setTasks(response.data || []);
        } else {
          setTasks([]);
        }
      } catch (error) {
        toast.error('Failed to load task data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, [user]);

  const handleTaskSubmit = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden font-poppins">
      <h1 className="text-2xl font-bold mb-6 flex items-center text-slate-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="truncate">Manage Topics / Submit Task</span>
      </h1>

      <Card className="mb-6">
        <TaskForm onTaskSubmit={handleTaskSubmit} />
      </Card>

      <Card
        title={
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate">Your Recent Task Submissions</span>
          </div>
        }
      >
        {tasks.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">
            No task submissions yet. Use the form above to submit your first task!
          </p>
        ) : (
          <div className="space-y-4">
            {(showAllRecentTasks ? tasks : tasks.slice(0, 5)).map((task) => (
              <div key={task._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      Submitted task: {task.points} points
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full flex-shrink-0">
                    +{task.points}
                  </div>
                </div>

                {task.topics && task.topics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {task.topics.map((topic, index) => (
                        <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100">
                          {topic?.topicName || topic?.name || 'Unknown Topic'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {tasks.length > 5 && (
              <button
                onClick={() => setShowAllRecentTasks(!showAllRecentTasks)}
                className="mt-4 w-full py-2 text-sm text-black hover:text-blue-800 border border-blue-300 rounded-md flex items-center justify-center cursor-pointer transition-colors"
              >
                {showAllRecentTasks ? (
                  <>Show Less <FaChevronUp className="ml-1" /></>
                ) : (
                  <>View All ({tasks.length}) Tasks <FaChevronDown className="ml-1" /></>
                )}
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkerManageTopicsPage;
