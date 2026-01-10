import { Habit } from '../types/habit';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api/habits';

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
    }
};
