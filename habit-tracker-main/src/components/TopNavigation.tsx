
import { FiMenu, FiSettings, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import './TopNavigation.css';

interface TopNavigationProps {
  onMenuClick: () => void;
  onTodayClick: () => void;
  onSettingsClick: () => void;
  onFeedbackClick: () => void;
  onCalendarClick: () => void;
}

function TopNavigation({
  onMenuClick,
  onTodayClick,
  onSettingsClick,
  onFeedbackClick,
  onCalendarClick
}: TopNavigationProps) {
  return (
    <div className="top-navigation">
      {/* Left side */}
      <button className="nav-button menu-button" onClick={onMenuClick}>
        <FiMenu />
      </button>

      <button className="today-pill" onClick={onTodayClick}>
        Today
      </button>

      {/* Right side */}
      <div className="nav-right">
        <button className="nav-button" onClick={onFeedbackClick} aria-label="Give Feedback">
          <FiMessageSquare />
        </button>
        <button className="nav-button" onClick={onCalendarClick}>
          <FiCalendar />
        </button>
        <button className="nav-button" onClick={onSettingsClick}>
          <FiSettings />
        </button>
      </div>
    </div>
  );
}

export default TopNavigation;
