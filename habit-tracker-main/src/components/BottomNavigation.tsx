import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import './BottomNavigation.css';

interface BottomNavigationProps {
  currentView: 'list' | 'tasks' | 'stats' | 'calendar' | 'notifications';
  onViewChange: (view: 'list' | 'tasks' | 'stats' | 'calendar' | 'notifications') => void;
  onAddHabit: () => void;
}

function BottomNavigation({ currentView, onViewChange, onAddHabit }: BottomNavigationProps) {
  const navigate = useNavigate();

  const handleHabitsClick = () => {
    navigate('/habits');
  };

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${currentView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
        aria-label="List View"
      >
        <span className="nav-icon">☰</span>
        <span className="nav-label">List</span>
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'tasks' ? 'active' : ''}`}
        onClick={() => onViewChange('tasks')}
        aria-label="Tasks"
      >
        <span className="nav-icon">✓</span>
        <span className="nav-label">Tasks</span>
      </button>

      <button
        className="bottom-nav-item center-fab"
        onClick={onAddHabit}
        aria-label="Add Habit"
      >
        <div className="fab-plus">
          <FiPlus />
        </div>
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'stats' ? 'active' : ''}`}
        onClick={() => onViewChange('stats')}
        aria-label="Stats"
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Stats</span>
      </button>

      <button
        className={`bottom-nav-item ${currentView === 'list' ? 'active' : ''}`}
        onClick={handleHabitsClick}
        aria-label="Habits"
      >
        <span className="nav-icon">🎯</span>
        <span className="nav-label">Habits</span>
      </button>
    </nav>
  );
}

export default BottomNavigation;
