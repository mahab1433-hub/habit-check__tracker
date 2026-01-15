import { FiMenu, FiSettings, FiEdit, FiCalendar } from 'react-icons/fi';
import './TopNavigation.css';

interface TopNavigationProps {
  onMenuClick: () => void;
  onTodayClick: () => void;
  onSettingsClick: () => void;
  onJournalClick: () => void;
  onCalendarClick: () => void;
}

function TopNavigation({
  onMenuClick,
  onTodayClick,
  onSettingsClick,
  onJournalClick,
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
        <button className="nav-button" onClick={onJournalClick} aria-label="Daily Journal">
          <FiEdit />
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
