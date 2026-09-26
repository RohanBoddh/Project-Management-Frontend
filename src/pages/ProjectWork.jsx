import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProjectWork.css";

function ProjectWork() {
  const { id } = useParams();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/work/project/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setWorks(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  return (
    <div className="project-work-container">
      <h2>🚀 Project Work Panel</h2>

      {loading ? (
        <p>Loading...</p>
      ) : works.length === 0 ? (
        <p>No work found.</p>
      ) : (
        works.map((work) => (
          <div key={work._id} className="work-card">
            <h3>{work.title}</h3>
            <p>{work.description}</p>

            {/* USERS */}
            <div className="user-section">
              <div className="user-box">
                <img
                  src={
                    work.sender?.profileImage
                      ? `http://localhost:5000/${work.sender.profileImage}`
                      : "/default-avatar.png"
                  }
                  alt="sender"
                  className="avatar"
                />
                <p>{work.sender?.name}</p>
              </div>

              <span className="arrow">→</span>

              <div className="user-box">
                <img
                  src={
                    work.receiver?.profileImage
                      ? `http://localhost:5000/${work.receiver.profileImage}`
                      : "/default-avatar.png"
                  }
                  alt="receiver"
                  className="avatar"
                />
                <p>{work.receiver?.name}</p>
              </div>
            </div>

            <p><strong>Stage:</strong> {work.stage}</p>
            <p><strong>Status:</strong> {work.status}</p>

            {/* FILES */}
            {work.files && work.files.length > 0 && (
              <div className="file-section">
                <h4>Attachments:</h4>
                {work.files.map((file, index) => (
                  <div key={index}>
                    <a
                      href={`http://localhost:5000/${file.path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 {file.name}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ProjectWork;