import { useState, useRef } from "react";
import "./UploadResume.css";

export default function UploadResume({ onUpload, loading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const MAX_FILE_SIZE_MB = 5;

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  // Drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  // Click on drag-drop area triggers file input click
  const handleAreaClick = () => {
    if (!loading) fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    onUpload(file);
    // Reset file input
    setFile(null);
    fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form" noValidate>
      <label htmlFor="resume-upload" className="upload-label">
        Select or drag & drop your resume (.pdf, .doc, .docx)
      </label>

      <input
        id="resume-upload"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        disabled={loading}
        ref={fileInputRef}
        className="file-input"
      />

      <div
        className={`drag-drop-area ${dragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleAreaClick();
          }
        }}
        aria-label="File upload area. Click to select or drag and drop a file."
      >
        {file ? (
          <p>
            Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        ) : (
          <p>Drag and drop a file here, or click to select</p>
        )}
      </div>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="upload-button"
      >
        {loading ? "Uploading..." : "Upload & Parse"}
      </button>
    </form>
  );
}
