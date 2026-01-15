import { useState, useEffect } from 'react';
import { Task } from '../types';
import { api } from '../services/api';
import './TaskDetailModal.css';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
    onDelete: (taskId: string) => void;
}

function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [dueDate, setDueDate] = useState(task.dueDate || '');
    const [startTime, setStartTime] = useState(task.startTime || '');
    const [stopTime, setStopTime] = useState(task.stopTime || '');
    const [isCompleted, setIsCompleted] = useState(task.status === 'Completed');

    // Update local state if task prop changes (unlikely in modal flow but good practice)
    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate || '');
        setStartTime(task.startTime || '');
        setStopTime(task.stopTime || '');
        setIsCompleted(task.status === 'Completed');
    }, [task]);

    const handleSave = async () => {
        const updatedTask: Task = {
            ...task,
            title,
            description,
            dueDate,
            startTime,
            stopTime,
            status: isCompleted ? 'Completed' : 'Pending'
        };

        // Call parent update immediately for UI responsiveness
        onUpdate(updatedTask);

        // Persist to backend
        await api.updateTask(updatedTask);

        onClose();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            await api.deleteTask(task.id);
            onDelete(task.id); // Notify parent to remove from list
            onClose();
        }
    };

    return (
        <div className="task-detail-modal-overlay">
            <div className="task-detail-modal">
                <div className="task-detail-header">
                    <button className="back-btn" onClick={onClose}>←</button>
                    <h1>Task Details</h1>
                    <div className="header-actions">
                        <button className="delete-btn-icon" onClick={handleDelete}>🗑️</button>
                    </div>
                </div>

                <div className="task-detail-scroll-content">
                    {/* Status Toggle */}
                    <div className="detail-group">
                        <div className="status-toggle-row" onClick={() => setIsCompleted(!isCompleted)}>
                            <div className={`checkbox-large ${isCompleted ? 'checked' : ''}`}>
                                {isCompleted && '✓'}
                            </div>
                            <span className="status-label">{isCompleted ? 'Completed' : 'Mark as Completed'}</span>
                        </div>
                    </div>

                    <div className="detail-group">
                        <label className="detail-label">Task Name</label>
                        <input
                            className="detail-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div className="detail-group">
                        <label className="detail-label">Description</label>
                        <textarea
                            className="detail-input"
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="detail-group">
                        <label className="detail-label">Date</label>
                        <input
                            type="date"
                            className="detail-input"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="detail-row">
                        <div className="detail-group">
                            <label className="detail-label">Start Time</label>
                            <input
                                type="time"
                                className="detail-input"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>

                        <div className="detail-group">
                            <label className="detail-label">Stop Time</label>
                            <input
                                type="time"
                                className="detail-input"
                                value={stopTime}
                                onChange={e => setStopTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-footer-actions">
                    <button className="save-btn" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailModal;
