import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import "./Profile.css";

function Profile() {
  const { user } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", photo: null });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch profile once
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setProfileData(res.data);
        setFormData({ name: res.data.name || "", photo: null });
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Cleanup preview memory
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const imageUrl = URL.createObjectURL(files[0]);
      setPreview(imageUrl);

      setFormData((prev) => ({
        ...prev,
        photo: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);

      if (formData.photo) {
        form.append("photo", formData.photo);
      }

      const res = await API.put("/users/updateProfile", form);

      // Only update local profile state
      setProfileData(res.data);

      setIsEditing(false);
      setPreview(null);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: profileData.name || "", photo: null });
    setPreview(null);
    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return <div className="loading1">Loading profile...</div>;
  }

  return (
    <div className="profile-container1">
      <div className="dashboard-card1">
        <h3>Personal Information</h3>

        {/* Click photo to open modal */}
        <div
          className="profile-photo1"
          onClick={() => setIsEditing(true)}
        >
          {profileData.photo ? (
            <img
              src={`https://project-management-backend-alpha.vercel.app/uploads/${profileData.photo}`}
              alt="Profile"
            />
          ) : (
            <div className="default-photo1">
              {profileData.name
                ? profileData.name.charAt(0).toUpperCase()
                : "U"}
            </div>
          )}
        </div>

        <p><strong>Name:</strong> {profileData.name}</p>
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Role:</strong> {profileData.role}</p>
      </div>

      {isEditing && (
        <div className="modal-overlay1">
          <div className="modal-content1">
            <h3>Customize Profile</h3>

            {error && <p className="error1">{error}</p>}

            <div className="photo-preview1">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : profileData.photo ? (
                <img
                  src={`https://project-management-backend-alpha.vercel.app/${profileData.photo}`}
                  alt="Profile"
                />
              ) : (
                <div className="default-photo1">
                  {profileData.name
                    ? profileData.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
              )}
            </div>

            <button
              type="button"
              className="upload-btn1"
              onClick={() => fileInputRef.current.click()}
            >
              Choose Photo
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleChange}
            />

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />

            <div className="button-group1">
              <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={handleCancel}
                className="cancel-btn1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;