// src/pages/Home.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeTasks: 0,
  });
  const [testimonials, setTestimonials] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ===============================
  // 🔥 Fetch Analytics (ONLY for Admin/Manager)
  // ===============================
  useEffect(() => {
    // Only fetch if user is logged in AND is admin/manager
    if (!user) {
      setAnalyticsLoading(false);
      return;
    }

    // Members cannot access analytics - skip the fetch
    if (user.role === "member") {
      setAnalyticsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch("https://project-management-backend-alpha.vercel.app/api/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        // If successful, update analytics
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
        // If 403/401, user doesn't have permission - this is expected for members
        // We simply ignore these errors
      } catch (error) {
        // Silently handle errors - don't log them
        // This prevents console errors for expected behavior
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // ===============================
  // 🔥 Fetch Testimonials (Public)
  // ===============================
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("https://project-management-backend-alpha.vercel.app/api/testimonials");

        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }

        const data = await response.json();
        setTestimonials(data);
      } catch (error) {
        console.log("Testimonials error:", error);
      }
    };

    fetchTestimonials();
  }, []);

  // ===============================
  // 🔥 Navigation Handler
  // ===============================
  const handleNavigation = (defaultPath) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (defaultPath === "/projects") {
      navigate("/projects");
    } else if (defaultPath === "/analytics") {
      if (user.role === "admin" || user.role === "manager") {
        navigate("/admin/analytics");
      } else {
        setShowPopup(true);
      }
    } else {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "manager") navigate("/manager");
      else navigate("/member");
    }
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Bring Your Team's Work <br />
            <span>To Life.</span>
          </h1>

          <p>
            Plan, track, and manage your projects with powerful tools designed
            for modern teams.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => handleNavigation("/dashboard")}
            >
              Get Started →
            </button>

            <button
              className="secondary-btn"
              onClick={() => handleNavigation("/projects")}
            >
              View Projects
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="mock-card">
            <h3>Project Overview</h3>
            {analyticsLoading ? (
              <p>Loading...</p>
            ) : user && (user.role === "admin" || user.role === "manager") ? (
              <>
                <p>✔ {analytics.activeTasks} Tasks Completed</p>
                <p>⏳ {analytics.totalProjects} Projects Active</p>
                <p>📅 Users: {analytics.totalUsers}</p>
              </>
            ) : (
              <>
                <p>✔ 0 Tasks Completed</p>
                <p>⏳ 0 Projects Active</p>
                <p>📅 0 Users</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="trust-section">
        <p>Trusted by {analytics.totalUsers}+ teams worldwide</p>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div
          className="feature-card"
          onClick={() => handleNavigation("/analytics")}
          style={{ cursor: "pointer" }}
        >
          <h3>📊 View System Analytics</h3>
          <p>Access detailed analytics and insights on system performance.</p>
        </div>

        <div className="feature-card">
          <h3>👥 Team Collaboration</h3>
          <p>Work together in real-time with task assignments.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Fast & Secure</h3>
          <p>Built with modern technologies for speed & safety.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonial-cards">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <p>"{testimonial.quote}"</p>
                <cite>
                  - {testimonial.name}, {testimonial.role}
                </cite>
              </div>
            ))
          ) : (
            <p>Loading testimonials...</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to boost productivity?</h2>

        <button
          className="primary-btn large"
          onClick={() => handleNavigation("/dashboard")}
        >
          Start Managing Now
        </button>
      </section>

      {/* ACCESS DENIED POPUP */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Access Denied</h3>
            <p>
              Sorry, only managers and admins can access this section.
            </p>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;