import { useState, useContext } from "react";
import { registerUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/auth.css";

const Register = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await registerUser(form);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      navigate("/dashboard");
    } catch (err) {
      alert("Register failed");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="department"
          placeholder="Department"
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

        <button type="submit">Register</button>

        <p className="auth-link">
          Already have account? <Link to="/login">Login</Link>
        </p>

        <button type="button" className="google-btn">
          Register with Google
        </button>
      </form>
    </div>
  );
};

export default Register;