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
  const [loading, setLoading] = useState(false);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= HANDLE REGISTER =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const department = form.department.trim();

    // ================= VALIDATION =================

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (!department) {
      alert("Please enter your department.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const registerData = {
        name,
        email,
        password,
        department,
      };

      console.log("REGISTER REQUEST:", {
        name,
        email,
        department,
        passwordProvided: Boolean(password),
      });

      const response = await registerUser(registerData);

      console.log("REGISTER RESPONSE:", response.data);

      const data = response.data;

      if (!data || !data.token || !data.user) {
        alert("Invalid response from server.");
        return;
      }

      // ================= NORMALIZE ROLE =================

      const role = String(data.user.role || "member")
        .toLowerCase()
        .trim();

      if (!["admin", "manager", "member"].includes(role)) {
        alert(
          "Invalid user role. Please contact the administrator."
        );
        return;
      }

      const registeredUser = {
        ...data.user,
        role,
      };

      // ================= SAVE LOGIN SESSION =================

      sessionStorage.setItem("token", data.token);

      sessionStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      setUser(registeredUser);

      // ================= ROLE BASED REDIRECT =================

      switch (role) {
        case "admin":
          navigate("/admin", { replace: true });
          break;

        case "manager":
          navigate("/manager", { replace: true });
          break;

        case "member":
          navigate("/member", { replace: true });
          break;

        default:
          navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      console.error("STATUS:", error.response?.status);
      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ================= JSX =================

  return (
    <div className="auth-container">
      <form
        className="auth-box"
        onSubmit={handleSubmit}
      >
        <h2>Register</h2>

        {/* NAME */}

        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          required
        />

        {/* EMAIL */}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        {/* DEPARTMENT */}

        <input
          name="department"
          type="text"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          required
        />

        {/* PASSWORD */}

        <div className="password-field">
          <input
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <span
            className="eye-icon"
            onClick={() =>
              setShowPassword(
                (previous) => !previous
              )
            }
            role="button"
            tabIndex={0}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === " "
              ) {
                setShowPassword(
                  (previous) => !previous
                );
              }
            }}
          >
            {showPassword ? (
              <FiEyeOff />
            ) : (
              <FiEye />
            )}
          </span>
        </div>

        {/* REGISTER BUTTON */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Registering..."
            : "Register"}
        </button>

        {/* LOGIN LINK */}

        <p className="auth-link">
          Already have account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        {/* GOOGLE */}

        <button
          type="button"
          className="google-btn"
          onClick={() =>
            alert(
              "Google Registration is not configured yet."
            )
          }
        >
          Register with Google
        </button>
      </form>
    </div>
  );
};

export default Register;
