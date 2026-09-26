import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset link sent to " + email);
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>

        <p className="auth-link">
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;