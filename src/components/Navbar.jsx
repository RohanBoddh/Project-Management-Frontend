import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSavePhoto = async () => {
    if (!photo) return;

    setSaving(true);
    setError("");

    try {
      const form = new FormData();
      form.append("photo", photo);

      const res = await fetch(
        "http://localhost:5000/api/users/updateProfile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) throw new Error("Failed to update photo");

      const updatedData = await res.json();

      console.log("Updated Data:", updatedData);

      // 🔥 IMPORTANT FIX
      setUser(updatedData);
      sessionStorage.setItem("user", JSON.stringify(updatedData));

      setShowCustomize(false);
      setShowDropdown(false);
      setPhoto(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nb-profile")) {
        setShowDropdown(false);
        setShowCustomize(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 🔥 IMAGE URL FIX
  const profileImageUrl = user?.photo
  ? user.photo.startsWith("uploads/")
    ? `http://localhost:5000/${user.photo}?t=${user.updatedAt}`
    : `http://localhost:5000/uploads/${user.photo}?t=${user.updatedAt}`
  : null;

  return (
    <nav className="nb-navbar">
      <div
        className={`nb-hamburger ${showLinks ? "nb-active" : ""}`}
        onClick={() => setShowLinks(!showLinks)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`nb-links ${showLinks ? "nb-active" : ""}`}>
        <li>
          <Link to="/" onClick={() => setShowLinks(false)}>
            Home
          </Link>
        </li>

        {user?.role === "admin" && (
          <li>
            <Link to="/admin" onClick={() => setShowLinks(false)}>
              AdminDashboard
            </Link>
          </li>
        )}

        {user?.role === "manager" && (
          <li>
            <Link to="/manager" onClick={() => setShowLinks(false)}>
              ManagerDashboard
            </Link>
          </li>
        )}

        {user?.role === "member" && (
          <li>
            <Link to="/member" onClick={() => setShowLinks(false)}>
              MemberDashboard
            </Link>
          </li>
        )}

        {(user?.role === "admin" || user?.role === "manager") && (
          <>
            <li>
              <Link to="/projects" onClick={() => setShowLinks(false)}>
                Projects
              </Link>
            </li>
            <li>
              <Link to="/teams" onClick={() => setShowLinks(false)}>
                Teams
              </Link>
            </li>
          </>
        )}
      </ul>

      <div className="nb-actions">
        {!user ? (
          <Link to="/login">
            <button className="nb-login-btn">Login</button>
          </Link>
        ) : (
          <div className="nb-profile">
            <div
              className="nb-profile-pic"
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
            >
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" />
              ) : (
                <div className="nb-default-pic">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>

            {showDropdown && (
              <div className="nb-dropdown">
                <div className="nb-dropdown-content">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCustomize(true);
                    }}
                    className="nb-customize-btn"
                  >
                    Customize Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="nb-logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {showCustomize && (
              <div
                className="nb-modal"
                onClick={() => setShowCustomize(false)}
              >
                <div
                  className="nb-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3>Customize Profile</h3>

                  {error && <p className="nb-error">{error}</p>}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />

                  <div className="nb-button-group">
                    <button onClick={handleSavePhoto} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      onClick={() => setShowCustomize(false)}
                      className="nb-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;