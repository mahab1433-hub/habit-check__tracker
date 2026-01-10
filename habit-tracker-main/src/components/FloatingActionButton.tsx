import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onHabitClick: () => void;
  onTaskClick: () => void;
}

function FloatingActionButton({ onHabitClick, onTaskClick }: FloatingActionButtonProps) {
  return (
    <div className="fab-container">
      <button className="fab fab-task" onClick={onTaskClick} aria-label="Add new task">
        <span className="fab-icon">✓</span>
      </button>
      <button className="fab fab-habit" onClick={onHabitClick} aria-label="Add new habit">
        <span className="fab-icon">+</span>
      </button>
    </div>
  );
}

export default FloatingActionButton;
