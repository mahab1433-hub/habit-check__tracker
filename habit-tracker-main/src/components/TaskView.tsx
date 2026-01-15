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
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await api.fetchTasks();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const addTask = async (title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => {
    const newTask = {
      title,
      description,
      dueDate,
      priority,
      status: 'Pending'
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    if (newStatus === 'Completed') playSuccessSound();

    await api.updateTask({ ...task, status: newStatus });
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

  return (
    <div className="task-view-page">
      <div className="task-view-container">
        <div className="task-header-simple">
          <h1>My Tasks</h1>
          <button className="add-task-button" onClick={() => setIsAddModalOpen(true)} aria-label="Add New Task">
            +
          </button>
        </div>

        <div className="task-list">
          {tasks.length === 0 ? (
            <div className="task-empty-state">
              <p>No tasks yet. Add your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTaskStatus}
                onEdit={handleEdit}
                onDelete={(id) => setTaskToDelete(id)}
              />
            ))
          )}
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

        {/* Delete Confirmation Modal */}
        {taskToDelete && (
          <div className="modal-backdrop" onClick={() => setTaskToDelete(null)}>
            <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
              <h3>Delete Task?</h3>
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="cancel-button" onClick={() => setTaskToDelete(null)}>Cancel</button>
                <button
                  className="delete-confirm-button"
                  onClick={() => {
                    if (taskToDelete) deleteTask(taskToDelete);
                    setTaskToDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskView;
