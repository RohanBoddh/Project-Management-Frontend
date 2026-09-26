import TaskCard from "./TaskCard";
const Column = ({ title, tasks }) => {
  return (
    <div className="column">
      <h3>{title}</h3>
      {tasks.map(task => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
};

export default Column;