import { useState, useEffect } from 'react';
import { Task } from '../types';
import { api } from '../services/api';
import TaskItem from './TaskItem';
import AddTaskModal from './AddTaskModal';
import { playSuccessSound } from '../utils/audio';
import './TaskView.css';

function TaskView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const data = await api.fetchTasks();
    setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Removed localStorage useEffects

  const addTask = async (title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => {
    const newTask = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority,
      status: 'Pending',
    };
    const created = await api.createTask(newTask);
    if (created) {
      setTasks(prev => [...prev, created]);
    }
  };

  const updateTask = async (id: string, title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    const updatedData = { ...taskToUpdate, title, description, dueDate, priority };
    const updated = await api.updateTask(updatedData);

    if (updated) {
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      setEditingTask(null);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    if (newStatus === 'Completed') playSuccessSound();

    const updated = await api.updateTask({ ...task, status: newStatus });
    // Revert if failed (optional, but good practice)
    if (!updated) {
      console.error("Failed to update status");
      setTasks(prev => prev.map(t => t.id === id ? task : t));
    }
  };

  const deleteTask = async (id: string) => {
    const success = await api.deleteTask(id);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  // Sort tasks: High priority first, then by due date (nearest first), then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First, sort by status (Pending first)
    if (a.status !== b.status) {
      return a.status === 'Pending' ? -1 : 1;
    }

    // Then by priority
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    // Then by due date (nearest first)
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }

    // Finally by creation date (newest first)
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="task-view-page">
      <div className="task-view-container">
        <div className="task-view-content">
          <button className="add-task-button" onClick={() => setIsAddModalOpen(true)}>
            + Add Task
          </button>

          <div className="task-list">
            {sortedTasks.length === 0 ? (
              <div className="task-empty-state">
                <p>No tasks yet. Add your first task!</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskStatus}
                  onEdit={handleEdit}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </div>

        <AddTaskModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onSave={editingTask
            ? (title, description, dueDate, priority) => updateTask(editingTask.id, title, description, dueDate, priority)
            : addTask
          }
          editingTask={editingTask}
        />
      </div>
    </div>
  );
}

export default TaskView;
