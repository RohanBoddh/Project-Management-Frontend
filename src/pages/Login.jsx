import { useState, useContext } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/auth.css";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    // Basic validation
    if (!form.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!form.password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const loginData = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      console.log("Sending Login Request:", {
        email: loginData.email,
      });

      const response = await loginUser(loginData);

      console.log("Login Response:", response.data);

      const data = response.data;

      // ================= CHECK SERVER RESPONSE =================
      if (!data || !data.token || !data.user) {
        alert("Invalid response from server.");
        return;
      }

      // ================= ROLE =================
      const role = String(data.user.role || "")
        .toLowerCase()
        .trim();

      // ================= VALID ROLE =================
      if (!["admin", "manager", "member"].includes(role)) {
        alert(
          "Invalid user role. Please contact the administrator."
        );
        return;
      }

      // ================= USER OBJECT =================
      const loggedInUser = {
        ...data.user,
        role: role,
      };

      // ================= SAVE TOKEN =================
      sessionStorage.setItem(
        "token",
        data.token
      );

      // ================= SAVE USER =================
      sessionStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      // ================= UPDATE AUTH CONTEXT =================
      setUser(loggedInUser);

      // ================= REDIRECT =================
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
          navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        "Login failed. Please check your email and password.";

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
        <h2>Login</h2>

        {/* ================= EMAIL ================= */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        {/* ================= PASSWORD ================= */}
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
            autoComplete="current-password"
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

        {/* ================= FORGOT PASSWORD ================= */}
        <p className="forgot-link">
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        {/* ================= LOGIN BUTTON ================= */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {/* ================= REGISTER ================= */}
        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

        {/* ================= GOOGLE LOGIN ================= */}
        <button
          type="button"
          className="google-btn"
          onClick={() =>
            alert(
              "Google Login is not configured yet."
            )
          }
        >
          Login with Google
        </button>
      </form>
    </div>
  );
};

export default Login;

