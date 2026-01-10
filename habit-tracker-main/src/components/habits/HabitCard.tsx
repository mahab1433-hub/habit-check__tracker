import { useState, useRef, useEffect } from 'react';
import { Habit } from '../../types/habit';
import { FiMoreVertical, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

import './HabitCard.css';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const HabitCard = ({ habit, onToggle, onEdit, onDelete }: HabitCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const today = new Date().toDateString();
  const isCompleted = habit.history[today]?.completed || false;
  const completionRate = calculateCompletionRate(habit);
  const streak = habit.streak || 0;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function calculateCompletionRate(habit: Habit): number {
    const dates = Object.keys(habit.history);
    if (dates.length === 0) return 0;

    const completed = dates.filter(date => habit.history[date].completed).length;
    return Math.round((completed / dates.length) * 100);
  }

  const handleToggle = () => {
    onToggle(habit.id);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(habit);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(habit.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`habit-card ${isCompleted ? 'completed' : ''}`}>
      <div className="habit-card-main" onClick={handleToggle}>
        <div className="habit-icon" style={{ backgroundColor: habit.color }}>
          {habit.icon || '📝'}
        </div>

        <div className="habit-info">
          <h3 className="habit-name">{habit.name}</h3>
          <div className="habit-meta">
            <span className="streak">🔥 {streak} days</span>
            <span className="completion">✅ {completionRate}%</span>
            {habit.reminder?.enabled && (
              <span className="reminder">⏰ {habit.reminder.time}</span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className={`status-indicator ${isCompleted ? 'completed' : ''}`}>
          {isCompleted ? <FiCheck /> : null}
        </div>
      </div>

      <div className="habit-actions" ref={menuRef}>
        <button
          className="menu-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
            setShowDeleteConfirm(false);
          }}
        >
          <FiMoreVertical />
        </button>

        {showMenu && (
          <div className="action-menu">
            <button onClick={handleEdit} className="menu-item">
              <FiEdit2 /> Edit
            </button>
            <button
              onClick={handleDelete}
              className={`menu-item delete ${showDeleteConfirm ? 'confirm' : ''}`}
            >
              <FiTrash2 /> {showDeleteConfirm ? 'Confirm?' : 'Delete'}
            </button>
            {showDeleteConfirm && (
              <button onClick={cancelDelete} className="menu-item cancel">
                <FiX /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
