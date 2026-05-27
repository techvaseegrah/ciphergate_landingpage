// attendance _31/client/src/components/worker/TaskForm.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getTaskTopics } from '../../services/taskTopicService';
import api from '../../services/api';

const TaskForm = ({ onTaskSubmit }) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState({});
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTaskTopics(user.subdomain);
        const uDeptId = String(user.department?._id || user.department);
        const validTopics = data.filter(t => {
          if (t.isAllDepartments) return true;
          const tDeptId = String(t.department?._id || t.department);
          return tDeptId === uDeptId;
        });
        setTopics(validTopics);
      } catch(e) {
        console.error(e);
      }
    };
    if (user?.subdomain) fetchTopics();
  }, [user]);

  const toggleTopic = (id) => {
    setSelectedTopics(prev => ({...prev, [id]: !prev[id]}));
  };

  const isFormValid = () => {
    return Object.values(selectedTopics).some(isSelected => isSelected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert('Please select at least one topic.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedTopicObjects = topics.filter(t => selectedTopics[t._id]);
      const totalPoints = selectedTopicObjects.reduce((acc, curr) => acc + (parseInt(curr.points) || 0), 0);
      const description = selectedTopicObjects.map(t => t.topicName).join(', ');

      const response = await api.post('/workers/submit-task', {
        points: totalPoints,
        description: description,
        topics: selectedTopicObjects.map(t => ({ _id: t._id }))
      });
      
      const newTask = response.data;
      
      setSelectedTopics({});
      
      if (onTaskSubmit) {
        onTaskSubmit(newTask);
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 3);
  
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-6">Submit Task</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-700 mb-4">Task Data</p>
          <p className="text-xs font-bold text-slate-500 mb-3">Topics</p>
          
          {topics.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No topics assigned to your department.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {displayedTopics.map(topic => {
                  const isSelected = !!selectedTopics[topic._id];
                  return (
                    <div 
                      key={topic._id}
                      onClick={() => toggleTopic(topic._id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="mt-1 accent-blue-600 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      />
                      <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {topic.topicName} ({topic.points} pts)
                      </span>
                    </div>
                  );
                })}
              </div>

              {topics.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllTopics(!showAllTopics)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {showAllTopics ? (
                    <>Show Less <FaChevronUp size={12} /></>
                  ) : (
                    <>View All ({topics.length}) Topics <FaChevronDown size={12} /></>
                  )}
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="px-6 py-2.5 bg-[#0fa388] hover:bg-[#0d8a73] text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-sm shadow-emerald-600/20"
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Submit Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;