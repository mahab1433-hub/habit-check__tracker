import { useState, FormEvent, useEffect } from 'react';
import { Task } from '../types';
import './AddTaskModal.css';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => void;
  editingTask?: Task | null;
}

function AddTaskModal({ isOpen, onClose, onSave, editingTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setDueDate(editingTask.dueDate);
        setPriority(editingTask.priority);
      } else {
        // Reset form when modal opens for new task
        setTitle('');
        setDescription('');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDueDate(tomorrow.toISOString().split('T')[0]);
        setPriority('Medium');
      }
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, editingTask]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    onSave(title.trim(), description.trim(), dueDate, priority);
    onClose();
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content add-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <button className="modal-close" onClick={handleCancel} aria-label="Close">
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g., Finish project report"
              className={error && !title.trim() ? 'input-error' : ''}
              autoFocus
            />
            {error && !title.trim() && <span className="error-message">{error}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date">Due Date *</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setError('');
              }}
              className={error && !dueDate ? 'input-error' : ''}
            />
            {error && !dueDate && <span className="error-message">{error}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {editingTask ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;
