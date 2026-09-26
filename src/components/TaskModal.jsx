import { useState } from "react";

function TaskModal({ isOpen, onClose, onAdd }) {
  const [taskTitle, setTaskTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      completed: false,
    };

    onAdd(newTask);
    setTaskTitle("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Task</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Name"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="modal-buttons">
            <button type="submit" className="add-btn">Add</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;