import { useState, useEffect } from "react";
import "./EditUserModal.css";

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    department: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "",
        department: user.department || "",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.department) {
      setError("Name, Email, and Department are required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const data = await res.json();
      onUserUpdated(data);
      onClose();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div
        className="edit-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit User</h2>
        {error && <p className="error">{error}</p>}

        <input name="name" value={formData.name} onChange={handleChange} />
        <input name="email" value={formData.email} onChange={handleChange} />
        <input name="phone" value={formData.phone} onChange={handleChange} />
        <input name="address" value={formData.address} onChange={handleChange} />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>

        <input name="department" value={formData.department} onChange={handleChange} />

        <div className="edit-button-group">
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;