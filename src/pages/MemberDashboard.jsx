import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MemberDashboard.css";

const MemberDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="member-dashboard">
      <div className="dashboard-header1">
        <div className="welcome-section1">
          <h1>👋 Welcome back, {user?.name || "Member"}!</h1>
          <p>Here's an overview of your projects and tasks</p>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-btn secondary"
          onClick={() => navigate("/my-tasks")}
        >
          <span className="btn-icon">✅</span>
          <span>My Tasks</span>
        </button>

        {/* ✅ NEW MY WORK BUTTON */}
        <button
          className="action-btn tertiary"
          onClick={() => navigate("/profile")}
        >
          <span className="btn-icon">👤</span>
          <span>My Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MemberDashboard;