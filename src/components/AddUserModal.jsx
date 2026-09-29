// AddUserModal.jsx
import { useState } from "react";
import "./AddUserModal.css";

const AddUserModal = ({ isOpen, onClose, onUserAdded, token }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "member",
    department: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://project-management-backend-alpha.vercel.app/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      onUserAdded(data);
      onClose(); // Close modal

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        role: "member",
        department: "",
      });

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay1"> {/* ✅ FIXED: Changed from "modal" to "modal-overlay" */}
      <div className="modal-content2">
        <h2>Add User</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <div className="button-group1">
            <button type="submit">Add User</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;