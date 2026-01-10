import { useState, useEffect } from 'react';
import { Task } from '../types';
import { saveTasks, loadTasks } from '../utils/storage';
import TaskItem from './TaskItem';
import AddTaskModal from './AddTaskModal';
import './TaskView.css';

function TaskView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    } else {
      // Save empty array to clear storage
      saveTasks([]);
    }
  }, [tasks]);

  const addTask = (title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, title: string, description: string, dueDate: string, priority: 'Low' | 'Medium' | 'High') => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, title: title.trim(), description: description.trim() || undefined, dueDate, priority }
        : task
    ));
    setEditingTask(null);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
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
