import { useState } from "react";
import { sendReport } from "../services/reportService";
import "./ReportModal.css";

const ReportModal = ({ projectId, onClose }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    await sendReport(projectId, message);
    alert("Report sent!");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Send Report</h3>
        <textarea
          placeholder="Write report..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Send</button>
          <button onClick={onClose} className="cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;