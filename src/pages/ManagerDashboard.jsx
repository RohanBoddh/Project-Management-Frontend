import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  // ================= FETCH PROJECTS =================
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        console.log("Fetched projects:", res.data);

        if (Array.isArray(res.data)) {
          setProjects(res.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };

    if (user?._id) {
      fetchProjects();
    }
  }, [user]);

  // ================= UI =================
  return (
    <div className="manager-dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Manager Dashboard</h1>
      </div>

      {/* WELCOME */}
      <div className="welcome-section">
        <h3>Welcome, {user?.name}!</h3>
        <p>Manage your team and projects efficiently</p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => navigate("/projects")}>
          <div className="card-icon">📁</div>
          <h4>Projects</h4>
          <p>Create and manage projects</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/teams")}>
          <div className="card-icon">👥</div>
          <h4>Assign Tasks</h4>
          <p>Assign tasks to team members</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/progress")}>
          <div className="card-icon">📈</div>
          <h4>Progress</h4>
          <p>Track project progress</p>
        </div>
      </div>

      {/* ================= USER INFO ================= */}
      <div className="info-section">
        <div className="info-card">
          <h4>Your Role</h4>
          <p className="role-badge">{user?.role}</p>
        </div>

        <div className="info-card">
          <h4>Your Email</h4>
          <p>{user?.email}</p>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
