const TaskCard = ({ task }) => {
  return (
    <div className="task-card">
      <h4>{task.title}</h4>
      <p>Assigned to: {task.assignedTo}</p>
      <p>Due: {task.dueDate}</p>
    </div>
  );
};

export default TaskCard;