import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AddProjectModal.css";

const BACKEND_URL = "https://project-management-backend-alpha.vercel.app/api";

const AddProjectModal = ({
  isOpen,
  onClose,
  onAdd,
  project = null,
  onUpdate,
  onDelete,
}) => {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [startDate, setStartDate] = useState(project?.startDate || "");
  const [endDate, setEndDate] = useState(project?.endDate || "");
  const [membersCount, setMembersCount] = useState(
    project?.membersCount || 1
  );
  const [assignedMembers, setAssignedMembers] = useState(
    project?.assignedMembers || []
  );
  const [priority, setPriority] = useState(project?.priority || "Medium");
  const [tags, setTags] = useState(project?.tags || []);
  const [budget, setBudget] = useState(project?.budget || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    member: null,
  });

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // ================= FETCH USERS =================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);

        const token = sessionStorage.getItem("token");

        if (!token) {
          console.log("No token found");
          setUsers([]);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("Users fetch failed with status:", res.status);
          setUsers([]);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          const onlyMembers = data.filter(
            (u) => u.role && u.role.toLowerCase() === "member"
          );

          setUsers(onlyMembers);

          console.log("Fetched members only:", onlyMembers);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.log("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // ================= FILTER USERS =================

  const filteredUsers = Array.isArray(users)
    ? users.filter(
      (user) =>
        user.role &&
        user.role.toLowerCase() === "member" &&
        ((user.name &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.department &&
            user.department
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (user.role &&
            user.role.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    : [];

  // ================= UPDATE STATE WHEN PROJECT CHANGES =================

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setStartDate(project.startDate || "");
      setEndDate(project.endDate || "");
      setMembersCount(project.membersCount || 1);
      setPriority(project.priority || "Medium");
      setTags(project.tags || []);
      setBudget(project.budget || "");

      setAssignedMembers(
        Array.isArray(project.assignedMembers)
          ? project.assignedMembers.map((m) =>
            typeof m === "object" ? m._id?.toString() : m?.toString()
          )
          : []
      );
    } else {
      setAssignedMembers([]);
    }
  }, [project]);

  if (!isOpen) return null;

  // ================= LOADING =================

  if (isLoadingUsers || users.length === 0) {
    return (
      <div className="modal1">
        <div
          className="modal-content1"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ================= TAG INPUT =================

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();

      const tag = e.target.value.trim();

      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }

      e.target.value = "";
    }
  };

  // ================= MEMBER CHANGE =================

  const handleMemberChange = (userId, isChecked) => {
    const id = userId.toString();

    if (isChecked && assignedMembers.length >= membersCount) {
      setError(`You can only assign up to ${membersCount} members.`);
      return;
    }

    if (isChecked) {
      if (!assignedMembers.includes(id)) {
        setAssignedMembers([...assignedMembers, id]);
      }
    } else {
      setAssignedMembers(assignedMembers.filter((m) => m !== id));
    }

    setError("");
  };

  // ================= RIGHT CLICK =================

  const handleRightClick = (e, member) => {
    e.preventDefault();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      member,
    });
  };

  const removeMember = () => {
    setAssignedMembers(
      assignedMembers.filter(
        (id) => id.toString() !== contextMenu.member.toString()
      )
    );

    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      member: null,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      member: null,
    });
  };

  // ================= SELECTED MEMBER DETAILS =================

  const getSelectedUserDetails = () => {
    return assignedMembers
      .map((id) => {
        const user = users.find(
          (u) => u._id.toString() === id.toString()
        );

        return user &&
          user.role &&
          user.role.toLowerCase() === "member"
          ? {
            _id: user._id,
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

  // ================= CREATE / UPDATE PROJECT =================

  const handleSubmit = async () => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      setError(
        "You do not have permission to create or edit projects. Only admins and managers can perform this action."
      );
      return;
    }

    if (
      !name ||
      !description ||
      membersCount < 1 ||
      !startDate ||
      !endDate
    ) {
      setError(
        "Please fill all required fields and members count must be at least 1"
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      const method = project ? "PUT" : "POST";

      const url = project
        ? `${BACKEND_URL}/projects/${project._id}`
        : `${BACKEND_URL}/projects`;

      console.log("Submitting to URL:", url);
      console.log("Method:", method);
      console.log("Sending assignedMembers:", assignedMembers);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          startDate,
          endDate,
          membersCount,
          assignedMembers,
          priority,
          tags,
          budget,
        }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to save project");
      }

      const data = await res.json();

      console.log("Response data:", data);

      if (project) {
        onUpdate(data);
      } else {
        onAdd(data);
      }

      onClose();

      // Reset form
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setMembersCount(1);
      setAssignedMembers([]);
      setPriority("Medium");
      setTags([]);
      setBudget("");
    } catch (err) {
      console.log("Error in handleSubmit:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE PROJECT =================

  const handleDelete = async () => {
    if (!project) return;

    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      setError("You do not have permission to delete projects.");
      return;
    }

    console.log("Deleting project:", project._id);

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(
        `${BACKEND_URL}/projects/${project._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to delete project");
      }

      onDelete(project._id);
      onClose();
    } catch (err) {
      console.log("Error in handleDelete:", err);
      setError(err.message);
    }
  };

  // ================= UI =================

  return (
    <div
      className="modal1"
      onClick={(e) => {
        if (e.target.classList.contains("modal1")) {
          closeContextMenu();
          onClose();
        }
      }}
    >
      <div
        className="modal-content1"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{project ? "Edit Project" : "Create Project"}</h2>

        {error && <p className="error1">{error}</p>}

        <input
          placeholder="Project Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="date-group1">
          <div className="date-item1">
            <input
              type="date"
              placeholder="Start Date *"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="date-label1">Assigning</span>
          </div>

          <div className="date-item1">
            <input
              type="date"
              placeholder="End Date *"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <span className="date-label1">Last Summition</span>
          </div>
        </div>

        <input
          type="number"
          min={1}
          placeholder="How many members will work?"
          value={membersCount}
          onChange={(e) => setMembersCount(Number(e.target.value))}
        />

        <button
          type="button"
          className="assign-btn1"
          onClick={() => setShowMemberPanel(!showMemberPanel)}
        >
          Assign Members (select employees for this project)
        </button>

        <div className="selected-members1">
          {selectedUserDetails.length > 0
            ? selectedUserDetails.map((user) => (
              <div
                key={user._id}
                className="member-detail1"
                onContextMenu={(e) =>
                  handleRightClick(e, user._id)
                }
              >
                <strong>{user.name}</strong> - {user.email} (
                {user.department}, {user.role})
              </div>
            ))
            : "None"}

          <span className="count1">
            ({assignedMembers.length}/{membersCount})
          </span>
        </div>

        <label>Priority</label>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <label>Tags (Press Enter to add)</label>

        <input
          placeholder="Add tag"
          onKeyDown={handleTagInput}
        />

        <div className="tags-container1">
          {tags.map((tag, index) => (
            <span key={index} className="tag1">
              {tag}
            </span>
          ))}
        </div>

        <input
          type="number"
          placeholder="Budget (optional)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <div className="button-group1">
          <button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : project
                ? "Update"
                : "Create"}
          </button>

          {project && (
            <button
              onClick={handleDelete}
              className="delete-btn1"
            >
              Delete
            </button>
          )}

          <button onClick={onClose}>Cancel</button>
        </div>
      </div>

      {/* ================= CONTEXT MENU ================= */}

      {contextMenu.visible && (
        <div
          className="context-menu1"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={removeMember}>
            Remove {contextMenu.member}
          </button>
        </div>
      )}

      {/* ================= MEMBER PANEL ================= */}

      {showMemberPanel && (
        <div className="member-panel1">
          <div className="panel-header1">
            <h3>Select Members</h3>

            <button
              onClick={() => setShowMemberPanel(false)}
            >
              ×
            </button>
          </div>

          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="users-list1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <label
                  key={user._id}
                  className="user-item1"
                >
                  <input
                    type="checkbox"
                    checked={assignedMembers.some(
                      (id) =>
                        id.toString() ===
                        user._id.toString()
                    )}
                    onChange={(e) =>
                      handleMemberChange(
                        user._id.toString(),
                        e.target.checked
                      )
                    }
                    disabled={
                      !assignedMembers.includes(
                        user._id.toString()
                      ) &&
                      assignedMembers.length >=
                      membersCount
                    }
                  />

                  <div className="user-details1">
                    <strong>{user.name}</strong> - {user.email} (
                    {user.department}, {user.role})
                  </div>
                </label>
              ))
            ) : (
              <p>No members available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProjectModal;
