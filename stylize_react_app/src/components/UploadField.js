import React from "react";
import { FaUpload } from "react-icons/fa";
import "./UploadField.css";

const UploadField = ({ label, setImage, setFile }) => {
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file); // Store file for form submission
      const fileURL = URL.createObjectURL(file);
      setImage(fileURL);
    }
  };

  return (
    <div className="upload-field">
      <label className="upload-label">{label}</label>
      <div className="upload-box">
        <input type="file" id={label} className="upload-input" onChange={handleUpload} />
        <label htmlFor={label} className="upload-button">
          <FaUpload className="upload-icon" /> Choose File
        </label>
      </div>
    </div>
  );
};

export default UploadField;
