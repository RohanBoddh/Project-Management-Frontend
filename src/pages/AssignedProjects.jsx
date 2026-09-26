// src/pages/AssignedProjects.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./AssignedProjects.css";

function AssignedProjects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please login to view your projects");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/member/assigned-projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching assigned projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on status
  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "in progress":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate progress
  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task) => task.status === "completed").length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  // Get project counts
  const projectCounts = {
    all: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    inProgress: projects.filter((p) => p.status === "in progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="assigned-projects-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your assigned projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assigned-projects-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={fetchAssignedProjects}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="assigned-projects-container">
      {/* Header */}
      <div className="projects-header">
        <div className="header-content">
          <h1>📁 My Assigned Projects</h1>
          <p>View and manage all your assigned projects</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{projectCounts.all}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-number">{projectCounts.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item in-progress">
            <span className="stat-number">{projectCounts.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item completed">
            <span className="stat-number">{projectCounts.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Projects ({projectCounts.all})
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({projectCounts.pending})
        </button>
        <button
          className={`filter-btn ${filter === "in progress" ? "active" : ""}`}
          onClick={() => setFilter("in progress")}
        >
          In Progress ({projectCounts.inProgress})
        </button>
        <button
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed ({projectCounts.completed})
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="no-projects">
          <div className="no-projects-icon">📭</div>
          <h2>No Projects Found</h2>
          <p>
            {filter === "all"
              ? "You don't have any projects assigned yet."
              : `No projects with "${filter}" status.`}
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-card-header">
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(project.priority) }}
                >
                  {project.priority || "Medium"}
                </span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status || "Pending"}
                </span>
              </div>

              <div className="project-card-body">
                <h3 className="project-title">{project.name}</h3>
                <p className="project-description">
                  {project.description?.substring(0, 100)}
                  {project.description?.length > 100 ? "..." : ""}
                </p>

                <div className="project-meta">
                  <div className="meta-item">
                    <span>📅</span>
                    <span>Due: {formatDate(project.deadline)}</span>
                  </div>
                  <div className="meta-item">
                    <span>👥</span>
                    <span>{project.team?.length || 0} members</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{calculateProgress(project)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculateProgress(project)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Task Summary */}
                <div className="task-summary">
                  <span className="task-total">
                    {project.tasks?.length || 0} Tasks
                  </span>
                  <div className="task-breakdown">
                    <span className="task-completed">
                      ✓ {project.tasks?.filter((t) => t.status === "completed").length || 0}
                    </span>
                    <span className="task-pending">
                      ⏳ {project.tasks?.filter((t) => t.status !== "completed").length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="project-card-footer">
                <button
                  className="view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/my-tasks?project=${project._id}`);
                  }}
                >
                  📋 View Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedProject(null)}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <div className="modal-badges">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(selectedProject.status),
                  }}
                >
                  {selectedProject.status}
                </span>
                <span
                  className="priority-badge"
                  style={{
                    backgroundColor: getPriorityColor(selectedProject.priority),
                  }}
                >
                  {selectedProject.priority}
                </span>
              </div>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h4>Description</h4>
                <p>
                  {selectedProject.description || "No description provided."}
                </p>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">
                    {formatDate(selectedProject.startDate)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date</span>
                  <span className="detail-value">
                    {formatDate(selectedProject.endDate)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deadline</span>
                  <span className="detail-value">
                    {formatDate(selectedProject.deadline)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Budget</span>
                  <span className="detail-value">
                    {selectedProject.budget || "N/A"}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Progress</h4>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Overall Progress</span>
                    <span>{calculateProgress(selectedProject)}%</span>
                  </div>
                  <div className="progress-bar large">
                    <div
                      className="progress-fill"
                      style={{ width: `${calculateProgress(selectedProject)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Team Members ({selectedProject.team?.length || 0})</h4>
                <div className="team-avatars">
                  {selectedProject.team?.slice(0, 5).map((member, index) => (
                    <div
                      key={index}
                      className="team-avatar"
                      title={member.name}
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {selectedProject.team?.length > 5 && (
                    <div className="team-avatar more">
                      +{selectedProject.team.length - 5}
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Tags</h4>
                <div className="tags-list">
                  {selectedProject.tags?.length > 0 ? (
                    selectedProject.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="no-tags">No tags</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="action-btn primary"
                onClick={() =>
                  navigate(`/my-tasks?project=${selectedProject._id}`)
                }
              >
                📋 View Tasks
              </button>
              <button
                className="action-btn secondary"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <div
            className="action-card"
            onClick={() => navigate("/my-tasks")}
          >
            <span className="action-icon">✅</span>
            <span className="action-text">My Tasks</span>
          </div>
          <div
            className="action-card"
            onClick={() => navigate("/notifications")}
          >
            <span className="action-icon">🔔</span>
            <span className="action-text">Notifications</span>
          </div>
          <div
            className="action-card"
            onClick={() => navigate("/profile")}
          >
            <span className="action-icon">👤</span>
            <span className="action-text">My Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignedProjects;