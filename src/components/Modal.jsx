import React from "react";
import "./Modal.css";
const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;