import { useEffect, useRef } from 'react';
import { Habit } from '../types/habit';
import { playSuccessSound } from '../utils/audio';
import { addNotification } from '../utils/notifications';

export function useHabitReminders(habits: Habit[]) {
    const lastCheckMinute = useRef<string>('');

    // Request permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Check for reminders every 10 seconds (to be responsive but not too heavy)
    useEffect(() => {
        const checkReminders = () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;

            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Avoid double triggering in the same minute
            if (lastCheckMinute.current === currentTime) return;
            lastCheckMinute.current = currentTime;

            habits.forEach(habit => {
                // Check legacy simple string or new object format
                // HabitForm saves: reminder: { enabled, time, days }
                // We also have habit.reminderTime at root level sometimes

                let reminderTime = '';
                let enabled = false;
                let days: number[] = [0, 1, 2, 3, 4, 5, 6]; // Default to every day if not specified

                if (habit.reminder && habit.reminder.enabled) {
                    reminderTime = habit.reminder.time;
                    enabled = true;
                    if (habit.reminder.days && habit.reminder.days.length > 0) {
                        days = habit.reminder.days;
                    }
                } else if (habit.reminderTime) {
                    // Fallback for older habits
                    reminderTime = habit.reminderTime;
                    enabled = true;
                }

                if (enabled && reminderTime === currentTime && days.includes(currentDay)) {
                    // Check if already completed today? Maybe we still remind them?
                    // Usually reminders are "Do it!" so if done, maybe silence?
                    // Let's check if completed today.
                    const todayKey = now.toISOString().split('T')[0];
                    if (!habit.completedDates.has(todayKey)) {
                        sendNotification(habit);
                    }
                }
            });
        };

        const intervalId = setInterval(checkReminders, 10000); // Check every 10s

        // Run immediately on first load too
        checkReminders();

        return () => clearInterval(intervalId);
    }, [habits]);

    const sendNotification = (habit: Habit) => {
        try {
            // Play sound
            playSuccessSound();

            const title = `Time for ${habit.name}!`;
            const message = `Don't forget to complete your habit: ${habit.name}. Only ${habit.streak} days streak so far!`;

            // Save to History using utility
            addNotification(title, message, 'habit');

            // Show browser notification
            const n = new Notification(title, {
                body: message,
                icon: '/vite.svg', // Fallback icon
                tag: `reminder-${habit.id}` // Prevent stacking multiple for same habit
            });

            n.onclick = () => {
                window.focus();
                n.close();
            };
        } catch (e) {
            console.error("Notification failed", e);
        }
    };
}
