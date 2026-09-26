// Footer.jsx - Updated to make About link scroll to Home page's About section
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Now using context
import "./Footer.css";

function Footer() {
  const { user } = useContext(AuthContext); // Get user from context
  const role = user?.role || "guest"; // Default to 'guest' if not logged in

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            {/* <li><a href="/#about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li> */}
          </ul>
        </div>
        <div className="footer-section">
          <h4>Role-Based Links</h4>
          <ul>
            {role === "admin" && (
              <>
                <li><a href="/admin">Admin Dashboard</a></li>
                <li><a href="/admin/assign">Assign Managers</a></li>
                <li><a href="/admin/users">Manage Users</a></li>
              </>
            )}
            {role === "manager" && (
              <>
                <li><a href="/manager">Manager Dashboard</a></li>
                <li><a href="/projects">My Projects</a></li>
                <li><a href="/teams">Team Members</a></li>
              </>
            )}
            {role === "member" && (
              <>
                <li><a href="/member">Member Dashboard</a></li>
                <li><a href="/profile">Profile</a></li>
              </>
            )}
            {role === "guest" && (
              <>
                <li><a href="/login">Login</a></li>
                <li><a href="/register">Register</a></li>
              </>
            )}
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <ul className="social-links">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i> Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i> Twitter</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i> LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Project Manager | All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;