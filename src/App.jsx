import React, { useState, useEffect } from "react";
import "./App.css";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    priority: "medium",
    completed: false 
  });
  const [editingId, setEditingId] = useState(null);
  const [editedTask, setEditedTask] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    priority: "medium",
    completed: false 
  });
  const [filter, setFilter] = useState("all"); // all, active, completed
  const [darkMode, setDarkMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    const savedTheme = localStorage.getItem("darkMode");
    if (saved) {
      const parsedTasks = JSON.parse(saved);
      // Ensure all tasks have IDs and priority
      const normalizedTasks = parsedTasks.map((task, index) => ({
        ...task,
        id: task.id || `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 11)}`,
        priority: task.priority || "medium"
      }));
      setTasks(normalizedTasks);
    }
    if (savedTheme) setDarkMode(savedTheme === "true");
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("darkMode", darkMode.toString());
    document.documentElement.classList.toggle("dark-mode", darkMode);
  }, [tasks, darkMode]);

  function addTask() {
    if (!newTask.title.trim()) {
      return;
    }
    setTasks([...tasks, { ...newTask, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}` }]);
    setNewTask({ title: "", description: "", deadline: "", priority: "medium", completed: false });
    setShowAddForm(false);
  }

  function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingId(taskId);
      setEditedTask({ ...task });
    }
  }

  function saveTask(taskId) {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...editedTask, id: taskId } : task
    ));
    setEditingId(null);
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter(task => task.id !== taskId));
  }

  function toggleCompletion(taskId) {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          setCelebrating(true);
          setTimeout(() => setCelebrating(false), 2000);
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    setTasks(updated);
  }

  function clearAll() {
    if (window.confirm("Clear all tasks?")) {
      setTasks([]);
    }
  }

  function getDaysUntilDeadline(deadline) {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getDeadlineStatus(deadline) {
    if (!deadline) return "none";
    const days = getDaysUntilDeadline(deadline);
    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days <= 3) return "urgent";
    if (days <= 7) return "soon";
    return "normal";
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                         task.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === "all" ? true :
      filter === "active" ? !task.completed :
      filter === "completed" ? task.completed : true;
    return matchesSearch && matchesFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = a.priority || "medium";
    const bPriority = b.priority || "medium";
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[bPriority] - priorityOrder[aPriority];
    }
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    return 0;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const totalCount = tasks.length;

  const priorityColors = {
    high: "var(--priority-high)",
    medium: "var(--priority-medium)",
    low: "var(--priority-low)"
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      {celebrating && <div className="celebration">🎉</div>}
      
      <div className="header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">✨</span>
            TaskMaster Pro
            <span className="title-icon">✨</span>
          </h1>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <p className="app-subtitle">Organize your life, one task at a time</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">
              {Math.round((completedCount / totalCount) * 100) || 0}%
            </div>
            <div className="stat-label">Progress</div>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        <button 
          className="add-task-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Cancel" : "➕ Add New Task"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-task-form">
          <h3>Create New Task</h3>
          <input 
            type="text" 
            placeholder="Task title *" 
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="form-input"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <textarea 
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="form-textarea"
            rows="3"
          />
          <div className="form-row">
            <input 
              type="date" 
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="form-input"
            />
            <select 
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="form-select"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>
          <button onClick={addTask} className="submit-btn">
            Add Task ✨
          </button>
        </div>
      )}

      <div className="tasks-container">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>{search ? "Try a different search term" : "Create your first task to get started!"}</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const deadlineStatus = getDeadlineStatus(task.deadline);
            const daysUntil = getDaysUntilDeadline(task.deadline);
            const isEditing = editingId === task.id;

            return (
              <div 
                key={task.id} 
                className={`task-card ${task.completed ? "completed" : ""} priority-${task.priority || "medium"}`}
              >
                {isEditing ? (
                  <div className="edit-form">
                    <input 
                      type="text" 
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="form-input"
                    />
                    <textarea 
                      value={editedTask.description}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      className="form-textarea"
                      rows="2"
                    />
                    <div className="form-row">
                      <input 
                        type="date" 
                        value={editedTask.deadline}
                        onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                        className="form-input"
                      />
                      <select 
                        value={editedTask.priority}
                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                        className="form-select"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                      </select>
                    </div>
                    <div className="edit-actions">
                      <button onClick={() => saveTask(task.id)} className="save-btn">
                        💾 Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-header">
                      <div className="task-checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => toggleCompletion(task.id)}
                          className="task-checkbox"
                          id={`task-${task.id}`}
                        />
                        <label htmlFor={`task-${task.id}`} className="checkbox-label"></label>
                      </div>
                      <h3 className={`task-title ${task.completed ? "strikethrough" : ""}`}>
                        {task.title}
                      </h3>
                      <div 
                        className="priority-badge"
                        style={{ backgroundColor: priorityColors[task.priority || "medium"] }}
                      >
                        {(task.priority || "medium") === "high" ? "🔴 High" : 
                         (task.priority || "medium") === "medium" ? "🟡 Medium" : "🟢 Low"}
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    
                    <div className="task-footer">
                      {task.deadline && (
                        <div className={`deadline-badge ${deadlineStatus}`}>
                          {deadlineStatus === "overdue" && "⏰ "}
                          {deadlineStatus === "today" && "🔥 "}
                          {deadlineStatus === "urgent" && "⚡ "}
                          {deadlineStatus === "soon" && "📅 "}
                          {deadlineStatus === "normal" && "📆 "}
                          {deadlineStatus === "overdue" 
                            ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""}`
                            : deadlineStatus === "today"
                            ? "Due today!"
                            : deadlineStatus === "urgent"
                            ? `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`
                            : deadlineStatus === "soon"
                            ? `Due in ${daysUntil} days`
                            : new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className="task-actions">
                        <button 
                          onClick={() => editTask(task.id)}
                          className="action-btn edit-btn"
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="action-btn delete-btn"
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {tasks.length > 0 && (
        <button onClick={clearAll} className="clear-all-btn">
          🗑️ Clear All Tasks
        </button>
      )}

      <div className="footer">
        <p>Made with ❤️ using React</p>
      </div>
    </div>
  );
}
