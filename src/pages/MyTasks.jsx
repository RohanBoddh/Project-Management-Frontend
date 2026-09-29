import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./MyTasks.css";

const MyTasks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload Modal State
  const [uploadModal, setUploadModal] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "https://project-management-backend-alpha.vercel.app/api/member/assigned-projects",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---

  const getProgress = (project) => {
    // Check if current user has submitted work
    const hasSubmitted = project.submissions?.some(
      (sub) => sub.memberId === user._id,
    );
    return hasSubmitted ? 100 : 0;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#10b981";
      case "in progress":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

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

  // --- Upload Handlers ---

  const openUploadModal = (project) => {
    setUploadModal({
      isOpen: true,
      projectId: project._id,
      projectName: project.name,
    });
    setUploadSuccess(false);
    setSelectedFile(null);
  };

  const closeUploadModal = () => {
    setUploadModal({ isOpen: false, projectId: null, projectName: "" });
    setSelectedFile(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const submitWork = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projectId", uploadModal.projectId);

    try {
      await axios.post(
        "https://project-management-backend-alpha.vercel.app/api/member/upload-work",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setUploadSuccess(true);
      // Refresh list to show 100% progress
      setTimeout(() => {
        fetchProjects();
        closeUploadModal();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="my-tasks-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-tasks-container">
        <div className="error-state">
          <h3>⚠️ Oops!</h3>
          <p>{error}</p>
          <button onClick={fetchProjects}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-tasks-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <h1>✅ My Tasks</h1>
          <p>View project details and submit your completed work</p>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects assigned to you yet.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              {/* A. Basic Project Info */}
              <div className="card-header">
                <div className="badges">
                  <span
                    className="badge priority"
                    style={{
                      backgroundColor: getPriorityColor(project.priority),
                    }}
                  >
                    {project.priority}
                  </span>
                  <span
                    className="badge status"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status}
                  </span>
                </div>
                <span className="budget">
                  💰 {formatCurrency(project.budget)}
                </span>
              </div>

              <div className="card-body">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-desc">{project.description}</p>

                {/* Dates */}
                <div className="date-row">
                  <div className="date-item">
                    <span className="label">Start:</span>
                    <span className="value">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  <div className="date-item">
                    <span className="label">End:</span>
                    <span className="value">{formatDate(project.endDate)}</span>
                  </div>
                </div>

                {/* B. Manager Info */}
                {project.assignedManager && (
                  <div className="manager-section">
                    <h4>Manager</h4>
                    <div className="manager-card">
                      <div className="avatar">
                        {project.assignedManager.name?.charAt(0)}
                      </div>
                      <div className="info">
                        <p className="name">{project.assignedManager.name}</p>
                        <p className="dept">
                          {project.assignedManager.department || "Management"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* C. Assigned Members */}
                <div className="members-section">
                  <h4>Team Members ({project.assignedMembers?.length || 0})</h4>
                  <div className="members-list">
                    {project.assignedMembers?.map((member, index) => (
                      <div key={index} className="member-item">
                        <div className="member-avatar">
                          {member.name?.charAt(0)}
                        </div>
                        <div className="member-info">
                          <span className="member-name">{member.name}</span>
                          <span className="member-email">{member.email}</span>
                          <span className="member-role">
                            {member.department} • {member.role || "Member"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* E. Tags Section */}
                {project.tags && project.tags.length > 0 && (
                  <div className="tags-section">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* D. Progress & Action */}
              <div className="card-footer">
                <div className="progress-section">
                  <div className="progress-label">
                    <span>Progress</span>
                    <span
                      className={
                        getProgress(project) === 100 ? "text-success" : ""
                      }
                    >
                      {getProgress(project)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgress(project)}%` }}
                    ></div>
                  </div>
                </div>

                {/* 🔥 Buttons Row */}
                <div className="action-buttons">
                  {/* Receive Work Button */}
                  <button
                    className="receive-work-btn"
                    onClick={() => navigate("/receive-work")}
                  >
                    📥 Receive Work
                  </button>

                  {/* Send Work Button */}
                  <button
                    className={`send-work-btn ${getProgress(project) === 100 ? "completed" : ""}`}
                    onClick={() => openUploadModal(project)}
                    disabled={getProgress(project) === 100}
                  >
                    {getProgress(project) === 100
                      ? "✅ Work Submitted"
                      : "📤 Send Work"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal.isOpen && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h3>Submit Work for {uploadModal.projectName}</h3>
              <button className="close-btn" onClick={closeUploadModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {uploadSuccess ? (
                <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h4>Work Submitted Successfully!</h4>
                  <p>Your file has been sent to the manager for review.</p>
                </div>
              ) : (
                <form onSubmit={submitWork}>
                  {/* Drag & Drop Area */}
                  <div
                    className={`drop-zone ${dragActive ? "active" : ""} ${selectedFile ? "file-selected" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="file-preview">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <p className="file-name">{selectedFile.name}</p>
                          <p className="file-size">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="remove-file"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📂</div>
                        <p>Drag & Drop your file here</p>
                        <span>OR</span>
                        <label htmlFor="file-upload" className="browse-btn">
                          Browse Files
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          hidden
                        />
                        <p className="file-types">
                          Allowed: PDF, ZIP, Images (JPG, PNG), Video (MP4),
                          Code Files
                        </p>
                      </>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={closeUploadModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={!selectedFile || uploading}
                    >
                      {uploading ? "Uploading..." : "Submit Work"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
