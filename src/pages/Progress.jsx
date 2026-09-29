import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import './Progress.css';

function Progress() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("https://project-management-backend-alpha.vercel.app/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching projects:", err);
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (project) => {
    if (!project.assignedMembers || project.assignedMembers.length === 0) return 0;
    return Math.min(100, Math.round((project.assignedMembers.length / project.membersCount) * 100));
  };

  // Get status based on progress
  const getStatus = (project) => {
    const progress = getProgressPercentage(project);
    if (progress === 0) return "Not Started";
    if (progress < 50) return "In Progress";
    if (progress < 100) return "Almost Complete";
    return "Completed";
  };

  // Get status color
  const getStatusColor = (project) => {
    const progress = getProgressPercentage(project);
    if (progress === 0) return "#666666";
    if (progress < 50) return "#FFA500";
    if (progress < 100) return "#2196F3";
    return "#4CAF50";
  };

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h1>Project Progress</h1>
        <button onClick={() => navigate("/manager")} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <div className="progress-stats">
        <div className="stat-card">
          <h3>{projects.length}</h3>
          <p>Total Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => getProgressPercentage(p) === 100).length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => getProgressPercentage(p) > 0 && getProgressPercentage(p) < 100).length}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => getProgressPercentage(p) === 0).length}</h3>
          <p>Not Started</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="progress-list">
          {projects.map((project) => (
            <div key={project._id} className="progress-card">
              <div className="progress-card-header">
                <h3>{project.name}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(project) }}
                >
                  {getStatus(project)}
                </span>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(project)}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {getProgressPercentage(project)}%
                </span>
              </div>

              <div className="progress-details">
                <div className="detail-item">
                  <span className="detail-label">Team Members:</span>
                  <span className="detail-value">
                    {project.assignedMembers ? project.assignedMembers.length : 0} / {project.membersCount}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">{project.priority || "Medium"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date:</span>
                  <span className="detail-value">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Progress;