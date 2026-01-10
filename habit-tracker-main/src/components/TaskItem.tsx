import { Task } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const getPriorityColor = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const isOverdue = () => {
    const date = new Date(task.dueDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today && task.status === 'Pending';
  };

  return (
    <div className={`task-item ${task.status === 'Completed' ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="task-main-content">
        <div className="task-checkbox-container">
          <input
            type="checkbox"
            checked={task.status === 'Completed'}
            onChange={() => onToggle(task.id)}
            className="task-checkbox"
            aria-label={`Mark ${task.title} as ${task.status === 'Completed' ? 'pending' : 'completed'}`}
          />
        </div>

        <div className="task-details">
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <span 
              className="task-priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span className={`task-due-date ${isOverdue() ? 'overdue-text' : ''}`}>
              📅 {formatDueDate(task.dueDate)}
            </span>
            <span className="task-status-badge">
              {task.status}
            </span>
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="task-action-button edit-button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
        >
          ✏️
        </button>
        <button
          className="task-action-button delete-button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
