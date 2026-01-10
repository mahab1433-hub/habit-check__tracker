import { Habit } from '../types/habit';
import './HabitItem.css';

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function HabitItem({ habit, selectedDate, isCompleted, onToggle, onDelete }: HabitItemProps) {
  return (
    <div className="habit-item" style={{ '--habit-color': habit.color } as React.CSSProperties}>
      <div className="habit-info">
        <div className="habit-color-indicator" style={{ backgroundColor: habit.color }} />
        <span className="habit-name">{habit.name}</span>
      </div>
      <div className="habit-actions">
        <button
          className={`complete-button ${isCompleted ? 'completed' : ''}`}
          onClick={onToggle}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? '✓' : '○'}
        </button>
        <button
          className="delete-button"
          onClick={onDelete}
          aria-label="Delete habit"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default HabitItem;
