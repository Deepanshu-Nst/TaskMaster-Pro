"use client";
import React, { useState, useEffect } from "react";

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "", completed: false });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: "", description: "", deadline: "", completed: false });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    if (!newTask.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    setTasks([...tasks, newTask]);
    setNewTask({ title: "", description: "", deadline: "", completed: false });
  }

  function editTask(index) {
    setEditingIndex(index);
    setEditedTask({ ...tasks[index] });
  }

  function saveTask(index) {
    const updated = [...tasks];
    updated[index] = editedTask;
    setTasks(updated);
    setEditingIndex(null);
  }

  function deleteTask(index) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  function toggleCompletion(index) {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  }

  function clearAll() {
    if (window.confirm("Clear all tasks?")) {
      setTasks([]);
    }
  }

  const filteredAndSortedTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.completed - b.completed);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", padding: "20px",
      backgroundColor: "#f4f4f4", fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>To-Do List</h1>

      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "50%", padding: "12px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input type="text" placeholder="Title" value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
        <input type="text" placeholder="Description" value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
        <input type="date" value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
        <button onClick={addTask}
          style={{ padding: "10px 15px", backgroundColor: "#007bff", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}>
          Add Task
        </button>
        <button onClick={clearAll}
          style={{ padding: "10px 15px", backgroundColor: "#dc3545", color: "white", borderRadius: "5px", border: "none", cursor: "pointer" }}>
          Clear All
        </button>
      </div>

      <ul style={{ width: "50%", textAlign: "left", paddingTop: "10px", listStyleType: "none" }}>
        {filteredAndSortedTasks.map((task, index) => (
          <li key={index}
            style={{ marginBottom: "10px", borderRadius: "5px", backgroundColor: "white", padding: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            {editingIndex === index ? (
              <>
                <input type="text" value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "5px" }} />
                <input type="text" value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "5px" }} />
                <input type="date" value={editedTask.deadline}
                  onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "5px" }} />
                <button onClick={() => saveTask(index)}
                  style={{ marginLeft: "5px", backgroundColor: "green", color: "white", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Save</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleCompletion(index)} />
                  <h3 style={{ marginBottom: "5px", textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </h3>
                </div>
                <p style={{ color: "#555", margin: "5px 0" }}>{task.description}</p>
                {task.deadline && <small style={{ color: "#999" }}>Deadline: {new Date(task.deadline).toLocaleDateString()}</small>}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => editTask(index)}
                    style={{ marginRight: "5px", backgroundColor: "yellow", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deleteTask(index)}
                    style={{ backgroundColor: "red", color: "white", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
