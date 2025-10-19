import React, { useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResumeUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    const seekerId = localStorage.getItem("jobSeekerId");

    if (!file || !seekerId) {
      toast.error("Please select a file and ensure you are logged in as Job Seeker", { position: "top-right" });
      return;
    }

    const allowedTypes = [".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some((type) => fileName.endsWith(type));

    if (!isValidType) {
      toast.error("Please upload only PDF, DOC, or DOCX files", { position: "top-right" });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB", { position: "top-right" });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("jobSeekerId", seekerId);
      fd.append("file", file);

      await api.post("/resumes/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Resume uploaded successfully!", { position: "top-right" });
      setFile(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      if (onUploaded) onUploaded();
    } catch (err) {
      const errorMessage = err.response?.data || err.message || "Upload failed";
      toast.error("Upload failed: " + errorMessage, { position: "top-right" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h4>Upload Resume</h4>
      </div>
      <div className="card-body">
        <form onSubmit={upload}>
          <div className="mb-3">
            <label className="form-label">
              Select Resume File (PDF, DOC, DOCX - Max 10MB)
            </label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={uploading}
            />
            {file && (
              <div className="mt-2">
                <small className="text-muted">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </small>
              </div>
            )}
          </div>
          <div className="form-check mb-3"></div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Uploading...
              </>
            ) : (
              "Upload Resume"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
