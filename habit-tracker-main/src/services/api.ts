import { Habit } from '../types/habit';

// Use environment variable for production URL, fallback to local proxy for development
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '';
const API_URL = `${API_BASE_URL}/api`;

const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    const userData = localStorage.getItem('auth_user_data');
    if (userData) {
        const { token } = JSON.parse(userData);
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const api = {
    // --- AUTH API ---
    login: async (email: string, password: string): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }
        return res.json();
    },

    register: async (name: string, email: string, password: string): Promise<any> => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
        }
        return res.json();
    },

    // --- HABITS API ---
    fetchHabits: async (): Promise<Habit[]> => {
        try {
            const res = await fetch(`${API_URL}/habits`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch habits');

            const data = await res.json();

            return data.map((h: any) => ({
                ...h,
                id: h._id,
                startDate: new Date(h.startDate),
                createdAt: new Date(h.createdAt),
                lastCompleted: h.lastCompleted ? new Date(h.lastCompleted) : undefined,
                completedDates: new Set(h.completedDates || [])
            }));
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createHabit: async (habit: Partial<Habit>): Promise<Habit | null> => {
        try {
            const payload = {
                ...habit,
                completedDates: habit.completedDates ? Array.from(habit.completedDates) : []
            };

            const res = await fetch(`${API_URL}/habits`, {
                method: 'POST',
                headers: getAuthHeaders(),
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
            throw error;
        }
    },

    updateHabit: async (habit: Habit): Promise<Habit | null> => {
        try {
            const { id, ...rest } = habit;
            const payload = {
                ...rest,
                completedDates: Array.from(habit.completedDates)
            };

            const res = await fetch(`${API_URL}/habits/${habit.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
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
            const res = await fetch(`${API_URL}/habits/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
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
            const res = await fetch(`${API_URL}/tasks`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            return data.map((t: any) => ({
                ...t,
                id: t._id,
            }));
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createTask: async (task: any): Promise<any | null> => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: getAuthHeaders(),
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
            const { id, _id, ...rest } = task;
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
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
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return res.ok;
        } catch (error) {
            console.error('Delete Task Error:', error);
            return false;
        }
    }
};
