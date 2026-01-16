
import { FiX, FiHome, FiCalendar, FiCheckSquare, FiBarChart2, FiSettings, FiUser, FiBell, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'list' | 'calendar' | 'tasks' | 'stats' | 'notifications') => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
}

function Sidebar({ isOpen, onClose, onNavigate, onSettingsClick, onHelpClick }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">Menu</h2>
          <button className="sidebar-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* User Profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <FiUser />
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.name || 'User'}</div>
            <div className="profile-email">{user?.email || 'No Email'}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button className="sidebar-item" onClick={() => { onNavigate('list'); onClose(); }}>
            <FiHome />
            <span>Home</span>
          </button>

          <button className="sidebar-item" onClick={() => { onNavigate('calendar'); onClose(); }}>
            <FiCalendar />
            <span>Calendar</span>
          </button>

          <button className="sidebar-item" onClick={() => { onNavigate('tasks'); onClose(); }}>
            <FiCheckSquare />
            <span>Tasks</span>
          </button>

          <button className="sidebar-item" onClick={() => { onNavigate('stats'); onClose(); }}>
            <FiBarChart2 />
            <span>Statistics</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Secondary Items */}
        <nav className="sidebar-nav">
          <button className="sidebar-item" onClick={() => { onSettingsClick(); onClose(); }}>
            <FiSettings />
            <span>Settings</span>
          </button>

          <button className="sidebar-item" onClick={() => { onNavigate('notifications'); onClose(); }}>
            <FiBell />
            <span>Notifications</span>
          </button>

          <button className="sidebar-item" onClick={() => { onHelpClick(); onClose(); }}>
            <FiHelpCircle />
            <span>Help & Support</span>
          </button>

          <button className="sidebar-item logout-item" onClick={() => {
            if (confirm('Log out panna poringala?')) logout();
          }}>
            <FiLogOut />
            <span>Log Out</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-text">Habit Tracker v1.0.0</div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
