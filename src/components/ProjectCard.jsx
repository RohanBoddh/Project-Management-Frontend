import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import TaskModal from "./TaskModal";

function ProjectCard({ project, projects, setProjects, onEdit, onDelete }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ Added
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [managerName, setManagerName] = useState("Not Assigned");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();

    if (project.assignedManager) {
      fetchManagerName(project.assignedManager);
    }
  }, [project]);

  const fetchManagerName = async (managerId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `https://project-management-backend-alpha.vercel.app/api/users/${managerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const user = await res.json();
        setManagerName(user.name);
      }
    } catch (err) {
      console.error("Failed to fetch manager name:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        "https://project-management-backend-alpha.vercel.app/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleAddTask = (task) => {
    const updatedProjects = projects.map((p) =>
      p.id === project.id
        ? { ...p, tasks: [...p.tasks, task] }
        : p
    );
    setProjects(updatedProjects);
  };

  const getMemberDetails = () => {
    return (project.assignedMembers || [])
      .map((memberId) => {
        const user = users.find(
          (u) => u._id.toString() === memberId.toString()
        );

        return user
          ? {
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
          }
          : null;
      })
      .filter(Boolean);
  };

  const memberDetails = getMemberDetails();
  const isAdmin = user && user.role === "admin";

  return (
    <div className="project-card">
      <h3>Project Name - {project.title || project.name}</h3>
      <p>Start Date: {project.startDate || "N/A"}</p>
      <p>Submission Date: {project.endDate || project.deadline || "N/A"}</p>
      <p>Description: {project.description || "No description available"}</p>
      <p>Status: {project.status}</p>

      <button onClick={() => setIsTaskModalOpen(true)}>
        + Add Task
      </button>

      {/* ✅ NEW WORK BUTTON */}
      <button
        onClick={() => navigate(`/project-work/${project._id}`)}
      >
        Work
      </button>

      {project.tasks &&
        project.tasks.map((task) => (
          <p key={task.id}>
            {task.completed ? "✅" : "⬜"} {task.title}
          </p>
        ))}

      <div className="members-list">
        <h4>Assigned Members:</h4>
        {memberDetails.length > 0 ? (
          memberDetails.map((member, index) => (
            <p key={index}>
              <strong>{member.name}</strong> - {member.email} (
              {member.department}, {member.role})
            </p>
          ))
        ) : (
          <p>No members assigned</p>
        )}
      </div>

      <p>
        <strong>Manager - {managerName}</strong>
      </p>

      <div className="card-actions">
        {isAdmin && <button onClick={() => onEdit(project)}>Edit</button>}
        {isAdmin && (
          <button onClick={() => onDelete(project.id)}>Delete</button>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}

export default ProjectCard;