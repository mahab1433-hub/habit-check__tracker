export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string; // YYYY-MM-DD format
    startTime?: string;
    stopTime?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'Completed';
    createdAt: string; // ISO string for sorting
}
