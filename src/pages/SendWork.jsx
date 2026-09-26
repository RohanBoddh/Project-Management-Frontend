import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SendWork.css";

function SendWork() {
  const { id } = useParams(); // project id from URL
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [sendTo, setSendTo] = useState("");

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check project id
    if (!id) {
      alert("Project ID missing ❌");
      return;
    }

    // Auto decide receiver if not manager
    let receiver = sendTo;

    if (role === "member") {
      receiver = "manager";
    }

    const formData = new FormData();
    formData.append("project", id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("sendTo", receiver);

    // ✅ IMPORTANT: actually send selected files
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("http://localhost:5000/api/work", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Work Sent Successfully ✅");
        navigate(`/project-work/${id}`);
      } else {
        console.log("Backend Error:", data);
        alert(data.message || "Error sending work ❌");
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className="send-container">
      <h2 className="send-title">📤 Send Work</h2>

      <form onSubmit={handleSubmit} className="send-form">
        <input
          type="text"
          placeholder="Work Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Only Manager sees this */}
        {role === "manager" && (
          <select
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            required
          >
            <option value="">Select Receiver</option>
            <option value="members">Send to Members</option>
            <option value="admin">Send to Admin</option>
          </select>
        )}

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />

        <button type="submit" className="submit-btn">
          Send Work
        </button>
      </form>
    </div>
  );
}

export default SendWork;