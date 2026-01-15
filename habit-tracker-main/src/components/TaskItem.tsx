import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const isCompleted = task.status === 'Completed';

  return (
    <div
      className={`task-item ${isCompleted ? 'completed' : ''}`}
      onClick={() => navigate(`/focus/${task.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-main-content">
        <div className="task-left">
          <div className="task-content">
            <h3 className={`task-title ${isCompleted ? 'strikethrough' : ''}`}>
              {task.title}
            </h3>
            <div className="task-meta">
              {task.dueDate && (
                <span className="task-date">
                  📅 {task.dueDate === new Date().toISOString().split('T')[0] ? 'Today' : task.dueDate}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="task-actions">
          <button
            className="task-action-button edit-button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            aria-label="Edit"
          >
            ✏️
          </button>
          <button
            className="task-action-button delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            aria-label="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
