import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Teams.css";

function Teams() {
  const { user } = useContext(AuthContext);

  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  // --- Right Panels States ---
  const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(false);
  const [isProjectPanelOpen, setIsProjectPanelOpen] = useState(false);

  // --- Form Data ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [],
    projectId: ""
  });

  // --- Search & Lists ---
  const [searchMember, setSearchMember] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // --- Main Page Search ---
  const [teamSearch, setTeamSearch] = useState("");

  const token = sessionStorage.getItem("token");

  // Role Check
  const isAdminOrManager =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "manager";

  // Fetch Teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data } = await axios.get("https://project-management-backend-alpha.vercel.app/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch Users & Projects when Modal Opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchData = async () => {
        try {
          const [projRes, userRes] = await Promise.all([
            axios.get("https://project-management-backend-alpha.vercel.app/api/projects", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("https://project-management-backend-alpha.vercel.app/api/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          // Filter sirf members (role: member)
          const members = (userRes.data || []).filter(
            u => u.role?.toLowerCase() === "member"
          );

          setAllProjects(projRes.data || []);
          setAllUsers(members);
        } catch (err) {
          console.error("Error fetching data", err);
        }
      };
      fetchData();
    }
  }, [isModalOpen]);

  // Filters
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      team.description.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    u.email.toLowerCase().includes(searchMember.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(searchMember.toLowerCase()))
  );

  const filteredProjects = allProjects.filter((p) =>
    p.name.toLowerCase().includes(searchProject.toLowerCase())
  );

  // --- HANDLERS ---

  // Open Modal (Reset)
  const handleOpenModal = () => {
    setFormData({ name: "", description: "", memberIds: [], projectId: "" });
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  // Open Edit Mode
  const handleEditClick = (e, team) => {
    e.stopPropagation();
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      memberIds: team.members?.map(m => m._id) || [],
      projectId: team.project?._id || ""
    });
    setIsModalOpen(true);
  };

  // Toggle Member Selection
  const toggleMember = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.memberIds.includes(userId);
      if (isSelected) {
        return { ...prev, memberIds: prev.memberIds.filter((id) => id !== userId) };
      } else {
        return { ...prev, memberIds: [...prev.memberIds, userId] };
      }
    });
  };

  // Select Project (Single)
  const selectProject = (projectId) => {
    setFormData((prev) => ({ ...prev, projectId }));
  };

  // Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        // Update
        const { data } = await axios.put(
          `https://project-management-backend-alpha.vercel.app/api/teams/${editingTeam._id}`,
          {
            name: formData.name,
            description: formData.description,
            project: formData.projectId,
            members: formData.memberIds
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTeams(teams.map((t) => (t._id === data._id ? data : t)));
      } else {
        // Create
        const { data } = await axios.post(
          "https://project-management-backend-alpha.vercel.app/api/teams",
          {
            name: formData.name,
            description: formData.description,
            project: formData.projectId,
            members: formData.memberIds
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTeams([...teams, data]);
      }

      setIsModalOpen(false);
      setFormData({ name: "", description: "", memberIds: [], projectId: "" });
    } catch (err) {
      console.log(err);
      alert("Error saving team");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team?")) return;
    try {
      await axios.delete(`https://project-management-backend-alpha.vercel.app/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(teams.filter((t) => t._id !== id));
      setActiveTeamId(null);
    } catch (err) {
      console.log(err);
    }
  };

  // Helper: Get Selected Member Names
  const getSelectedMemberNames = () => {
    const selected = allUsers.filter(u => formData.memberIds.includes(u._id));
    return selected.map(u => u.name).join(", ");
  };

  // Helper: Get Selected Project Name
  const getSelectedProjectName = () => {
    const proj = allProjects.find(p => p._id === formData.projectId);
    return proj ? proj.name : "None";
  };

  // Helper: Format Date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <div className="teams-page">

      {/* Header */}
      <div className="teams-header">
        <h1>Teams</h1>
        {isAdminOrManager && (
          <button className="teams-add-btn" onClick={handleOpenModal}>
            + Add Team
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search teams..."
        className="teams-search"
        value={teamSearch}
        onChange={(e) => setTeamSearch(e.target.value)}
      />

      {/* Cards Grid */}
      <div className="teams-grid">
        {filteredTeams.length === 0 ? (
          <p className="teams-empty">No teams found.</p>
        ) : (
          filteredTeams.map((team) => {
            const isOpen = activeTeamId === team._id;
            return (
              <div
                key={team._id}
                className={`team-card ${isOpen ? "team-card-open" : ""}`}
                onClick={() => setActiveTeamId(isOpen ? null : team._id)}
              >
                <h3>{team.name}</h3>
                <p className="team-desc-preview">{team.description}</p>

                {isOpen && (
                  <div className="team-extra">
                    {/* Project */}
                    <div className="detail-row">
                      <span className="detail-label">Project:</span>
                      <span className="detail-value badge-project">
                        {team.project?.name || "None"}
                      </span>
                    </div>

                    {/* Members */}
                    <div className="detail-row">
                      <span className="detail-label">Members:</span>
                      <span className="detail-value1">
                        {team.members?.length > 0
                          ? team.members
                            .map(
                              (m) =>
                                `${m.name} (${m.email} - ${m.department})`
                            )
                            .join(", ")
                          : "No members"}
                      </span>
                    </div>

                    {/* Created By */}
                    <div className="created-by-section">
                      <p className="created-by-title">Created By:</p>

                      {team.createdBy ? (
                        <div className="creator-info">
                          <div className="creator-item">
                            <strong>Name:</strong> {team.createdBy.name}
                          </div>

                          {team.createdBy.department && (
                            <div className="creator-item">
                              <strong>Department:</strong> {team.createdBy.department}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>No creator info</p>
                      )}

                      <p className="created-date">
                        Created On: {formatDate(team.createdAt)}
                      </p>
                    </div>

                    {/* Actions (Admin/Manager Only) */}
                    {isAdminOrManager && (
                      <div className="team-actions">
                        <button onClick={(e) => handleEditClick(e, team)}>Edit</button>
                        <button className="team-delete" onClick={(e) => { e.stopPropagation(); handleDelete(team._id); }}>Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================== */}
      {/* ========= MAIN ADD/EDIT MODAL =========== */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="add-team-modal-overlay">
          <div className="add-team-modal-box">
            <h2>{editingTeam ? "Edit Team" : "Create New Team"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Assign Member Button */}
              <div className="form-group">
                <label>Assign Members</label>
                <button
                  type="button"
                  className="assign-btn"
                  onClick={() => setIsMemberPanelOpen(true)}
                >
                  Assign Member ({formData.memberIds.length})
                </button>
                <p className="selected-preview">
                  {formData.memberIds.length > 0 ? getSelectedMemberNames() : "No members selected"}
                </p>
              </div>

              {/* Assign Project Button */}
              <div className="form-group">
                <label>Assign Project</label>
                <button
                  type="button"
                  className="assign-btn"
                  onClick={() => setIsProjectPanelOpen(true)}
                >
                  Assign Project
                </button>
                <p className="selected-preview">
                  Project: <strong>{getSelectedProjectName()}</strong>
                </p>
              </div>

              <div className="modal-actions">
                <button type="submit" className="create-btn">
                  {editingTeam ? "Update Team" : "Create Team"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT PANEL: MEMBERS ================= */}
          {isMemberPanelOpen && (
            <>
              <div className="panel-overlay" onClick={() => setIsMemberPanelOpen(false)}></div>
              <div className="right-panel">
                <div className="panel-header">
                  <h3>Select Members</h3>
                  <button onClick={() => setIsMemberPanelOpen(false)}>Done</button>
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, Email, Dept..."
                  className="panel-search"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                />
                <div className="panel-list">
                  {filteredUsers.length === 0 ? (
                    <p className="no-data">No members found</p>
                  ) : (
                    filteredUsers.map(u => (
                      <div
                        key={u._id}
                        className={`panel-item ${formData.memberIds.includes(u._id) ? 'active' : ''}`}
                        onClick={() => toggleMember(u._id)}
                      >
                        <div className="item-info">
                          <div className="item-main">
                            <b>{u.name}</b>
                            {formData.memberIds.includes(u._id) && <span className="check-icon">✓</span>}
                          </div>
                          <div className="item-details">
                            <span>📧 {u.email}</span>
                            <span>🏢 {u.department || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ================= RIGHT PANEL: PROJECTS ================= */}
          {isProjectPanelOpen && (
            <>
              <div className="panel-overlay" onClick={() => setIsProjectPanelOpen(false)}></div>
              <div className="right-panel">
                <div className="panel-header">
                  <h3>Select Project (One)</h3>
                  <button onClick={() => setIsProjectPanelOpen(false)}>Done</button>
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="panel-search"
                  value={searchProject}
                  onChange={(e) => setSearchProject(e.target.value)}
                />
                <div className="panel-list">
                  {filteredProjects.length === 0 ? (
                    <p className="no-data">No projects found</p>
                  ) : (
                    filteredProjects.map(p => (
                      <div
                        key={p._id}
                        className={`panel-item ${formData.projectId === p._id ? 'active' : ''}`}
                        onClick={() => selectProject(p._id)}
                      >
                        <div className="item-info">
                          <b>{p.name}</b>
                        </div>
                        <div className="checkbox">
                          {formData.projectId === p._id && "✓"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Teams;