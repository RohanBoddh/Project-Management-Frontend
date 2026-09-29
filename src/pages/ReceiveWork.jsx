import { useEffect, useState } from "react";
import "./ReceiveWork.css";

function ReceiveWork() {
  const [works, setWorks] = useState([]);
  const token = sessionStorage.getItem("token");

  const fetchWorks = async () => {
    try {
      const res = await fetch(
        "https://project-management-backend-alpha.vercel.app/api/work/received",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setWorks(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  return (
    <div className="receive-container">
      <h2 className="receive-title">📥 Received Work Inbox</h2>

      {works.length === 0 && (
        <p className="empty-text">No received work found.</p>
      )}

      {works.map((work) => (
        <div key={work._id} className="receive-card">
          <h3>{work.title}</h3>

          <p className="description">{work.description}</p>

          <p>
            <strong>Project:</strong> {work.project?.name}
          </p>

          <hr />

          <h4 className="sender-heading">👤 Sender Details</h4>

          <div className="sender-details">
            <p><strong>Name:</strong> {work.sender?.name}</p>
            <p><strong>Email:</strong> {work.sender?.email}</p>
            <p><strong>Department:</strong> {work.sender?.department}</p>
            <p><strong>Role:</strong> {work.sender?.role}</p>
          </div>

          <p className="date">
            <strong>Sent On:</strong>{" "}
            {new Date(work.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ReceiveWork;