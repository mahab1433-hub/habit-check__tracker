import { useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import './SettingsButton.css';

interface SettingsButtonProps {
  onClick: () => void;
}

function SettingsButton({ onClick }: SettingsButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="settings-button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Settings"
    >
      <FiSettings className={`settings-icon ${isHovered ? 'spin' : ''}`} />
    </button>
  );
}

export default SettingsButton;
