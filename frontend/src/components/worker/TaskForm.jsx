// attendance _31/client/src/components/worker/TaskForm.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TaskForm = ({ onTaskSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Check if form is valid
  const isFormValid = () => {
    // At least one field value must be greater than 0
    return Object.values(formData).some(value => parseInt(value) > 0);
  };
  
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isFormValid()) {
    alert('Please enter at least one value.');
    return;
  }

  setIsSubmitting(true);

  try {
    // Simulate task creation since the service has been removed
    const newTask = {
      _id: Date.now().toString(), // Simple mock ID
      points: parseInt(formData.points) || 0,
      description: formData.description || 'Task submitted',
      createdAt: new Date().toISOString(),
      topics: [] // Empty array since topics service is removed
    };
    
    // Reset form
    setFormData({});
    
    // Notify parent component
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
  
return (
  <div>
    <h2 className="text-xl font-semibold mb-4">Submit Task</h2>
    
    <form onSubmit={handleSubmit}>
      {/* Simple Task Data Input */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Task Data</h3>
        
        <div className="mb-4">
          <label htmlFor="taskPoints" className="form-label">
            Points
          </label>
          <input
            type="number"
            id="taskPoints"
            className="form-input"
            value={formData.points || ''}
            onChange={(e) => handleFieldChange('points', e.target.value)}
            min="0"
            placeholder="Enter points"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="taskDescription" className="form-label">
            Description
          </label>
          <input
            type="text"
            id="taskDescription"
            className="form-input"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Enter description"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !isFormValid()}
        >
          {isSubmitting ? <Spinner size="sm" /> : 'Submit Task'}
        </Button>
      </div>
    </form>
  </div>
);
};

export default TaskForm;