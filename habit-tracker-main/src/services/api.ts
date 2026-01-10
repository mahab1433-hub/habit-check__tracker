import { Habit } from '../types/habit';

// Use relative path so it works with proxy (local & ngrok)
const API_URL = '/api/habits';

export const api = {
    fetchHabits: async (): Promise<Habit[]> => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to fetch habits');

            const data = await res.json();

            return data.map((h: any) => ({
                ...h,
                id: h._id, // Map MongoDB _id to frontend id
                startDate: new Date(h.startDate),
                createdAt: new Date(h.createdAt),
                // Handle optional dates
                lastCompleted: h.lastCompleted ? new Date(h.lastCompleted) : undefined,
                // Convert array back to Set for frontend
                completedDates: new Set(h.completedDates || [])
            }));
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createHabit: async (habit: Partial<Habit>): Promise<Habit | null> => {
        console.log('API createHabit called with:', habit); // Debug log
        try {
            // Convert Set to Array for transmission
            const payload = {
                ...habit,
                completedDates: habit.completedDates ? Array.from(habit.completedDates) : []
            };

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to create habit');

            const h = await res.json();
            return {
                ...h,
                id: h._id,
                startDate: new Date(h.startDate),
                createdAt: new Date(h.createdAt),
                completedDates: new Set(h.completedDates || [])
            };
        } catch (error) {
            console.error('Create Error Details:', error);
            throw error; // Re-throw to be caught by the page
        }
    },

    updateHabit: async (habit: Habit): Promise<Habit | null> => {
        try {
            const payload = {
                ...habit,
                completedDates: Array.from(habit.completedDates)
            };

            // Use _id or id for the URL parameter
            const res = await fetch(`${API_URL}/${habit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to update habit');

            const h = await res.json();
            return {
                ...h,
                id: h._id,
                startDate: new Date(h.startDate),
                createdAt: new Date(h.createdAt),
                completedDates: new Set(h.completedDates || [])
            };
        } catch (error) {
            console.error('Update Error:', error);
            return null;
        }
    },

    deleteHabit: async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Delete Error:', error);
            return false;
        }
    },

    // --- TASKS API ---
    fetchTasks: async (): Promise<any[]> => {
        try {
            const res = await fetch('/api/tasks');
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            return data.map((t: any) => ({
                ...t,
                id: t._id, // Map MongoDB _id to frontend id
            }));
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createTask: async (task: any): Promise<any | null> => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (!res.ok) throw new Error('Failed to create task');
            const t = await res.json();
            return { ...t, id: t._id };
        } catch (error) {
            console.error('Create Task Error:', error);
            return null;
        }
    },

    updateTask: async (task: any): Promise<any | null> => {
        try {
            const { id, _id, ...rest } = task; // Exclude id from body if needed, or Mongo handles it
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rest),
            });
            if (!res.ok) throw new Error('Failed to update task');
            const t = await res.json();
            return { ...t, id: t._id };
        } catch (error) {
            console.error('Update Task Error:', error);
            return null;
        }
    },

    deleteTask: async (id: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            return res.ok;
        } catch (error) {
            console.error('Delete Task Error:', error);
            return false;
        }
    }
};
