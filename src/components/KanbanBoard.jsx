import Column from "./Column";
import "./KanbanBoard.css";
const KanbanBoard = ({ tasks }) => {
  return (
    <div className="kanban-board">
      <Column title="Todo" tasks={tasks.filter(t => t.status === "todo")} />
      <Column title="In Progress" tasks={tasks.filter(t => t.status === "in-progress")} />
      <Column title="Done" tasks={tasks.filter(t => t.status === "done")} />
    </div>
  );
};

export default KanbanBoard;