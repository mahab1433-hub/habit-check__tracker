import { useState, useEffect } from 'react';
import { FiBell, FiTrash2, FiClock } from 'react-icons/fi';
import './NotificationCenter.css';

interface AppNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: string;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        loadNotifications();

        // Listen for new notifications
        const handleStorage = () => loadNotifications();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const loadNotifications = () => {
        const saved = localStorage.getItem('app_notifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        }
    };

    const clearAll = () => {
        if (window.confirm('Clear all notifications?')) {
            localStorage.setItem('app_notifications', '[]');
            setNotifications([]);
            window.dispatchEvent(new Event('storage'));
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="notification-center-page">
            <div className="notification-header">
                <h2>Notification Center</h2>
                {notifications.length > 0 && (
                    <button className="clear-all-btn" onClick={clearAll}>
                        <FiTrash2 /> Clear All
                    </button>
                )}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <FiBell className="empty-icon" />
                        <p>No notifications yet</p>
                        <small>Reminders will appear here</small>
                    </div>
                ) : (
                    notifications.map(note => (
                        <div key={note.id} className="notification-card">
                            <div className="notification-icon-container">
                                <FiBell />
                            </div>
                            <div className="notification-content">
                                <div className="notification-top">
                                    <span className="notification-title">{note.title}</span>
                                    <span className="notification-time">
                                        <FiClock size={12} /> {formatTime(note.timestamp)}
                                    </span>
                                </div>
                                <p className="notification-message">{note.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
