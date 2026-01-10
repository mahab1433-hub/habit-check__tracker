export interface AppNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'habit' | 'system' | 'achievement';
}

export const addNotification = (title: string, message: string, type: 'habit' | 'system' | 'achievement' = 'system') => {
    try {
        const newNotification: AppNotification = {
            id: Date.now().toString(),
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type
        };

        const existing = JSON.parse(localStorage.getItem('app_notifications') || '[]');
        localStorage.setItem('app_notifications', JSON.stringify([newNotification, ...existing]));

        // Dispatch event to update UI components
        window.dispatchEvent(new Event('storage'));

        return newNotification;
    } catch (error) {
        console.error('Failed to add notification:', error);
        return null;
    }
};
