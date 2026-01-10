export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string; // YYYY-MM-DD format
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'Completed';
    createdAt: string; // ISO string for sorting
}

export interface TaskData {
    tasks: Task[];
}
