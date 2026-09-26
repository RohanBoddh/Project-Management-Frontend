// AssignManagers.jsx (full code for assigning managers to projects)
import { useEffect, useState } from "react";
import "./AssignManagers.css"; // Optional: Create for styling

const AssignManagers = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch users
      const userRes = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error("Failed to fetch users");
      const usersData = await userRes.json();
      setUsers(usersData);

      // Fetch projects
      const projectRes = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!projectRes.ok) throw new Error("Failed to fetch projects");
      const projectsData = await projectRes.json();
      setProjects(projectsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToManager = async () => {
    if (!selectedUser) return alert("Select a user to promote.");

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "manager" }), // Update role to manager
      });

      if (!res.ok) throw new Error("Failed to promote user");
      alert("User promoted to manager!");
      fetchData(); // Refresh data
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleAssignManagerToProject = async () => {
    if (!selectedUser || !selectedProject) return alert("Select a user and project.");

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedManager: selectedUser }), // Add assignedManager field (user ID)
      });

      if (!res.ok) throw new Error("Failed to assign manager");
      alert("Manager assigned to project!");
      fetchData(); // Refresh data
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="assign-managers-container">
      <h1>Assign Managers</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Promote User to Manager */}
          <div className="section">
            <h3>Promote User to Manager</h3>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Select User</option>
              {users.filter(u => u.role !== "admin").map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
              ))}
            </select>
            <button onClick={handlePromoteToManager}>Promote to Manager</button>
          </div>

          {/* Assign Manager to Project */}
          <div className="section">
            <h3>Assign Manager to Project</h3>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Select Manager</option>
              {users.filter(u => u.role === "manager").map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
            <button onClick={handleAssignManagerToProject}>Assign Manager</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssignManagers;