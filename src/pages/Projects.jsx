import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import AddProjectModal from "../components/AddProjectModal";
import "./Projects.css";

function Projects() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Request Modal States for Manager
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    membersCount: 1,
    priority: "Medium",
    tags: [],
    budget: "",
    assignedMembers: [],
  });
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const [editingProject, setEditingProject] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [expandedForm, setExpandedForm] = useState({});
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [users, setUsers] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [managerName, setManagerName] = useState("Not Assigned");

  const token = sessionStorage.getItem("token");

  // Check if user is admin or manager
  const isAdmin = user?.role?.toLowerCase().trim() === "admin";
  const isManager = user?.role?.toLowerCase().trim() === "manager";

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data);
      setFilteredProjects(data);
      console.log("Fetched projects:", data);
    } catch (err) {
      console.log("Error fetching projects:", err);
    }
  };

  // Fetch users - ONLY for Admin
  const fetchUsers = async () => {
    if (!isAdmin && !isManager) return;

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        console.log("Fetched users:", data);
        return;
      }

      const data = await res.json();
      setUsers(data);
      console.log("Fetched users:", data);
    } catch (err) {
      console.log("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin || isManager) {
      fetchUsers();
    }
  }, [user, isAdmin, isManager]);

  // Filter projects based on search term
  useEffect(() => {
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.tags &&
          project.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          )),
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.role?.toLowerCase().trim() === "member" &&
      (user.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        (user.department &&
          user.department
            .toLowerCase()
            .includes(memberSearchTerm.toLowerCase())) ||
        (user.role &&
          user.role.toLowerCase().includes(memberSearchTerm.toLowerCase()))),
  );

  // Add project - Admin
  const handleAddProject = (newProject) => {
    setProjects([...projects, newProject]);
  };

  // Submit project request - Manager
  const handleSubmitRequest = async () => {
    if (
      !requestForm.name ||
      !requestForm.description ||
      !requestForm.startDate ||
      !requestForm.endDate
    ) {
      setRequestError("Please fill all required fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/projects/request",
        requestForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await fetchProjects();

      setRequestSuccess("Project request sent to Admin for approval!");
      setRequestError("");

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccess("");
        setRequestForm({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          membersCount: 1,
          priority: "Medium",
          tags: [],
          budget: "",
          assignedMembers: [],
        });
      }, 2000);
    } catch (err) {
      console.log("Error submitting request:", err);
      setRequestError("Failed to submit request");
    }
  };

  // Handle tag input for request form
  const handleRequestTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (!requestForm.tags.includes(tag)) {
        setRequestForm({ ...requestForm, tags: [...requestForm.tags, tag] });
      }
      e.target.value = "";
    }
  };

  // Remove tag from request form
  const removeRequestTag = (tagToRemove) => {
    setRequestForm({
      ...requestForm,
      tags: requestForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Update project
  const handleUpdateProject = (updatedProject) => {
    setProjects(
      projects.map((p) => (p._id === updatedProject._id ? updatedProject : p)),
    );
    fetchProjects();
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p._id !== projectId));
      fetchProjects();
      setExpandedProjectId(null);
    } catch (err) {
      console.log("Error deleting project:", err);
    }
  };

  // Handle card click
  const handleCardClick = (project) => {
    // Close card if already open
    if (expandedProjectId === project._id) {
      setExpandedProjectId(null);
      setExpandedForm({});
      setShowMemberPanel(false);
      setManagerName("Not Assigned");
      return;
    }

    // Open card
    setExpandedProjectId(project._id);

    /**
     * IMPORTANT FIX
     * Backend sends assignedMembers as OBJECTS (because of populate)
     * We must convert them into IDs for checkbox system
     */
    const filteredAssigned = (project.assignedMembers || []).map((member) =>
      typeof member === "object" ? member._id.toString() : member.toString(),
    );

    // Fill edit form
    setExpandedForm({
      name: project.name || "",
      description: project.description || "",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
      membersCount: project.membersCount || 1,
      assignedMembers: filteredAssigned, // ✅ FIXED
      priority: project.priority || "Medium",
      tags: project.tags || [],
      budget: project.budget || "",
    });

    setShowMemberPanel(false);

    // Manager name
    if (project.assignedManager?.name) {
      setManagerName(project.assignedManager.name);
    } else {
      setManagerName("Not Assigned");
    }
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setExpandedForm({ ...expandedForm, [field]: value });
  };

  // Handle member change
  const handleMemberChange = (userId, isChecked) => {
    const assignedMembers = expandedForm.assignedMembers || [];

    if (isChecked && assignedMembers.length >= expandedForm.membersCount) {
      setError(
        `You can only assign up to ${expandedForm.membersCount} members.`,
      );
      return;
    }

    if (isChecked) {
      if (!assignedMembers.includes(userId)) {
        setExpandedForm({
          ...expandedForm,
          assignedMembers: [...assignedMembers, userId],
        });
      }
    } else {
      setExpandedForm({
        ...expandedForm,
        assignedMembers: assignedMembers.filter((id) => id !== userId),
      });
    }

    setError("");
  };

  // Handle tags input
  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (!expandedForm.tags.includes(tag)) {
        setExpandedForm({ ...expandedForm, tags: [...expandedForm.tags, tag] });
      }
      e.target.value = "";
    }
  };

  // Submit update
  const handleUpdate = async () => {
    if (
      !expandedForm.name ||
      !expandedForm.description ||
      expandedForm.membersCount < 1 ||
      !expandedForm.startDate ||
      !expandedForm.endDate
    ) {
      setError("Please fill all required fields");
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:5000/api/projects/${expandedProjectId}`,
        expandedForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      handleUpdateProject(res.data);
      setExpandedProjectId(null);
      setExpandedForm({});
      setShowMemberPanel(false);
    } catch (err) {
      console.log("Error updating project:", err);
      setError("Failed to update project");
    }
  };

  // Get selected user details
  const getSelectedUserDetails = () => {
    return (expandedForm.assignedMembers || [])
      .map((id) => {
        const user = users.find((u) => u._id.toString() === id.toString());

        return user && user.role === "member"
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

  const selectedUserDetails = getSelectedUserDetails();

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>

        {/* Admin: Add Project Button */}
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-project-btn"
          >
            + Add Project
          </button>
        )}

        {/* Manager: Request Project Button */}
        {isManager && (
          <button
            onClick={() => {
              console.log("Request Button Clicked");
              setIsRequestModalOpen(true);
            }}
            className="add-project-btn"
          >
            + Request Project
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search projects by name, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <p className="not-found">No projects found.</p>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className={`project-card1 ${expandedProjectId === project._id ? "expanded" : ""}`}
              onClick={() => handleCardClick(project)}
            >
              {expandedProjectId === project._id ? (
                <div
                  className="expanded-form"
                  onClick={(e) => e.stopPropagation()}
                >
                  {error && <p className="error">{error}</p>}
                  <p>
                    <strong>
                      Manager -{" "}
                      {project.assignedManager?.name || "Not Assigned"}
                    </strong>
                  </p>

                  <input
                    placeholder="Project Name *"
                    value={expandedForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    disabled={!isAdmin}
                  />
                  <textarea
                    placeholder="Description *"
                    value={expandedForm.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    disabled={!isAdmin}
                  />
                  <div className="date-group">
                    <div className="date-item">
                      <input
                        type="date"
                        value={expandedForm.startDate}
                        onChange={(e) =>
                          handleFormChange("startDate", e.target.value)
                        }
                        disabled={!isAdmin}
                      />
                      <span className="date-label">Start Date</span>
                    </div>
                    <div className="date-item">
                      <input
                        type="date"
                        value={expandedForm.endDate}
                        onChange={(e) =>
                          handleFormChange("endDate", e.target.value)
                        }
                        disabled={!isAdmin}
                      />
                      <span className="date-label">End Date</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    placeholder="How many members will work?"
                    value={expandedForm.membersCount}
                    onChange={(e) =>
                      handleFormChange("membersCount", Number(e.target.value))
                    }
                    disabled={!isAdmin}
                  />

                  {isAdmin && (
                    <button
                      type="button"
                      className="assign-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMemberPanel(!showMemberPanel);
                      }}
                    >
                      Assign Members
                    </button>
                  )}
                  <div className="selected-members">
                    <h3 className="assigned-members-heading">
                      Assigned Members
                    </h3>

                    {selectedUserDetails.length > 0 ? (
                      selectedUserDetails.map((member, index) => (
                        <div key={index} className="member-detail">
                          <strong>{member.name}</strong> - {member.email} (
                          {member.department}, {member.role})
                        </div>
                      ))
                    ) : (
                      <p className="no-members">No members assigned</p>
                    )}

                    <span className="count">
                      ({(expandedForm.assignedMembers || []).length}/
                      {expandedForm.membersCount})
                    </span>
                  </div>

                  <label>Priority</label>
                  <select
                    value={expandedForm.priority}
                    onChange={(e) =>
                      handleFormChange("priority", e.target.value)
                    }
                    disabled={!isAdmin}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <label>Tags (Press Enter to add)</label>
                  <input
                    placeholder="Add tag"
                    onKeyDown={handleTagInput}
                    disabled={!isAdmin}
                  />
                  <div className="tags-container">
                    {(expandedForm.tags || []).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Budget (optional)"
                    value={expandedForm.budget}
                    onChange={(e) => handleFormChange("budget", e.target.value)}
                    disabled={!isAdmin}
                  />

                  <div className="button-group">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate();
                        }}
                      >
                        Update
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProjectId(null);
                      }}
                    >
                      Close
                    </button>
                  </div>

                  {/* Sliding Members Panel */}
                  <div
                    className={`member-panel ${showMemberPanel ? "active" : ""}`}
                  >
                    <div className="member-panel-header">
                      <h3>Select Members</h3>
                      <button
                        className="close-btn"
                        onClick={() => setShowMemberPanel(false)}
                      >
                        ×
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search users..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="search-input"
                    />

                    <div className="members-list">
                      {filteredUsers.map((user) => (
                        <label key={user._id} className="member-checkbox">
                          <input
                            type="checkbox"
                            checked={(
                              expandedForm.assignedMembers || []
                            ).includes(user._id.toString())}
                            onChange={(e) =>
                              handleMemberChange(
                                user._id.toString(),
                                e.target.checked,
                              )
                            }
                          />
                          <div className="user-details-all">
                            <strong>{user.name}</strong> - {user.email} (
                            {user.department}, {user.role})
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <div className="project-actions">

  {/* RECEIVE WORK */}
  <button
    className="work-btn"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/project-work/${project._id}`);
    }}
  >
    Receive Work
  </button>

  {/* SEND WORK */}
  <button
    className="send-work-btn"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/send-work/${project._id}`);
    }}
  >
    Send Work
  </button>

  {/* ADMIN ONLY */}
  {isAdmin && (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(project);
        }}
        className="edit-btn-project"
      >
        Edit
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProject(project._id);
        }}
        className="delete-btn"
      >
        Delete
      </button>
    </>
  )}
</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Add Project Modal */}
      {isAdmin && (
        <AddProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddProject}
        />
      )}
      {/* Manager Request Project Modal */}
      {isRequestModalOpen && (
        <div className="request-modal">
          <div className="request-modal-content">
            <h2>Request New Project</h2>

            {requestSuccess && (
              <p className="success-message">{requestSuccess}</p>
            )}

            {requestError && <p className="error">{requestError}</p>}

            <input
              className="request-project-name"
              placeholder="Project Name *"
              value={requestForm.name}
              onChange={(e) =>
                setRequestForm({ ...requestForm, name: e.target.value })
              }
            />

            <textarea
              placeholder="Description *"
              value={requestForm.description}
              onChange={(e) =>
                setRequestForm({ ...requestForm, description: e.target.value })
              }
            />

            <div className="date-group">
              <div className="date-item">
                <input
                  type="date"
                  className="date-item1"
                  value={requestForm.startDate}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      startDate: e.target.value,
                    })
                  }
                />
                <span className="date-label">Start Date</span>
              </div>
              <div className="date-item">
                <input
                  type="date"
                  className="date-item2"
                  value={requestForm.endDate}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, endDate: e.target.value })
                  }
                />
                <span className="date-label">End Date</span>
              </div>
            </div>

            <input
              type="number"
              className="member-number"
              min={1}
              placeholder="How many members will work? *"
              value={requestForm.membersCount}
              onChange={(e) =>
                setRequestForm({
                  ...requestForm,
                  membersCount: Number(e.target.value),
                })
              }
            />
            {/* Assign Members Button */}
            <button
              className="assign-members-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMemberPanel(!showMemberPanel); // toggles panel
              }}
            >
              {showMemberPanel ? "Close Members Panel" : "Assign Members"}
            </button>
            {/* Sliding Members Panel for Request Modal */}
            <div className={`member-panel ${showMemberPanel ? "active" : ""}`}>
              <div className="member-panel-header">
                <h3>Select Members</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowMemberPanel(false)}
                >
                  ×
                </button>
              </div>

              <input
                type="text"
                placeholder="Search users..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                className="search-input"
              />

              <div className="members-list">
                {filteredUsers.map((user) => (
                  <label key={user._id} className="member-checkbox">
                    <input
                      type="checkbox"
                      checked={(requestForm.assignedMembers || []).includes(
                        user._id,
                      )}
                      onChange={(e) => {
                        const assigned = requestForm.assignedMembers || [];

                        if (e.target.checked) {
                          if (assigned.length >= requestForm.membersCount)
                            return;

                          setRequestForm({
                            ...requestForm,
                            assignedMembers: [...assigned, user._id],
                          });
                        } else {
                          setRequestForm({
                            ...requestForm,
                            assignedMembers: assigned.filter(
                              (id) => id !== user._id,
                            ),
                          });
                        }
                      }}
                    />
                    <div className="user-details-all">
                      <strong>{user.name}</strong> - {user.email} (
                      {user.department}, {user.role})
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <label>Priority</label>
            <select
              className="priority1"
              value={requestForm.priority}
              onChange={(e) =>
                setRequestForm({ ...requestForm, priority: e.target.value })
              }
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label>Tags (Press Enter to add)</label>
            <input
              className="request-tag-input"
              placeholder="Add tag"
              onKeyDown={handleRequestTagInput}
            />
            <div className="tags-container">
              {requestForm.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeRequestTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              className="budget-input"
              type="number"
              placeholder="Budget (optional)"
              value={requestForm.budget}
              onChange={(e) =>
                setRequestForm({ ...requestForm, budget: e.target.value })
              }
            />

            <div className="button-group">
              <button onClick={handleSubmitRequest}>Submit Request</button>
              <button
                onClick={() => {
                  setIsRequestModalOpen(false);
                  setRequestError("");
                  setRequestSuccess("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
