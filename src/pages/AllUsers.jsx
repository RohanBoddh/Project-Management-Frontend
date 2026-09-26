import { useState, useEffect } from "react";
import axios from "axios";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import "./AllUsers.css";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(res.data);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  return (
    <div className="allusers-container1">
      <div className="users-card1">
        <div className="users-header1">
          <h2>All Users</h2>
          <button
            className="add-user-btn1"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add User
          </button>
        </div>

        <div className="table-wrapper1">
          <table className="users-table1">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>ADDRESS</th>
                <th>ROLE</th>
                <th>DEPARTMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7">No Users Found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{user.address || "-"}</td>
                    <td>{user.role}</td>
                    <td>{user.department}</td>
                    <td>
                      <button
                        onClick={() => editUser(user._id)}
                        className="edit-btn1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="delete-btn1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
        token={sessionStorage.getItem("token")}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

export default AllUsers;