import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProjectRequests.css";

function ProjectRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const containerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    fetchRequests();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSelectedRequest(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(
        "https://project-management-backend-alpha.vercel.app/api/projects/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        }
      );

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `https://project-management-backend-alpha.vercel.app/api/projects/request/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Your old logic kept (status update)
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status } : r
        )
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

  // ✅ NEW DELETE FUNCTION (Only Added)
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      await axios.delete(
        `https://project-management-backend-alpha.vercel.app/api/projects/request/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const toggleRequest = (req) => {
    if (selectedRequest?._id === req._id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(req);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d)) return "Invalid Date";

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    return `$${Number(budget).toLocaleString()}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <span className="badge badge-pending1">Pending</span>;
      case "approved":
        return <span className="badge badge-approved1">Approved</span>;
      case "rejected":
        return <span className="badge badge-rejected1">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="requests-container1" ref={containerRef}>
      <div className="requests-header1">
        <button className="back-btn1" onClick={() => navigate("/admin")}>
          <i className="fas fa-arrow-left1"></i> Back to Dashboard
        </button>
        <h1>Project Requests</h1>
        <p>Manage project requests from managers</p>
      </div>

      {loading ? (
        <div className="loading-container1">
          <div className="spinner1"></div>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state1">
          <i className="fas fa-inbox1"></i>
          <h3>No Requests Found</h3>
          <p>There are no project requests at the moment.</p>
        </div>
      ) : (
        <div className="requests-grid1">
          {requests.map((req) => (
            <div
              key={req._id}
              className={`request-card1 ${selectedRequest?._id === req._id ? "selected" : ""
                }`}
              onClick={() => toggleRequest(req)}
            >
              <div className="card-header1">
                <span className="project-name1">{req.name}</span>
                {getStatusBadge(req.status)}
              </div>

              <div className="card-body1">
                <p className="manager-info1">
                  <i className="fas fa-user1"></i>
                  <strong>Manager:</strong> {req.requestedBy?.name || "N/A"}
                </p>
                <p className="date-info1">
                  <i className="fas fa-calendar-alt1"></i>
                  {formatDate(req.createdAt)}
                </p>
                <p className="priority-info1">
                  <i className="fas fa-flag1"></i>
                  <strong>Priority:</strong> {req.priority || "N/A"}
                </p>
              </div>

              {selectedRequest?._id === req._id && (
                <div className="card-details1">

                  {/* ✅ Conditional Buttons Added Only */}
                  {req.status?.toLowerCase() === "pending" ? (
                    <div className="action-buttons1">
                      <button
                        className="btn btn-success1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(req._id, "approved");
                        }}
                      >
                        <i className="fas fa-check1"></i> Approve
                      </button>

                      <button
                        className="btn btn-danger1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(req._id, "rejected");
                        }}
                      >
                        <i className="fas fa-times1"></i> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons1">
                      <button
                        className="btn btn-danger1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(req._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectRequests;