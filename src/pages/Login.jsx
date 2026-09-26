import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/auth.css";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await loginUser(form);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      switch (data.user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "member":
          navigate("/member");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <p className="forgot-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        <button type="submit">Login</button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <button type="button" className="google-btn">
          Login with Google
        </button>
      </form>
    </div>
  );
};

export default Login;