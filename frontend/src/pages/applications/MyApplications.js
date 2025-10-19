import React, { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import { FaInfoCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const statusColors = {
    APPLIED: "#0d6efd",
    IN_REVIEW: "#6c757d",
    SHORTLISTED: "#ffc107",
    REJECTED: "#dc3545",
    HIRED: "#198754",
  };

  const statusSteps = ["APPLIED", "IN_REVIEW", "SHORTLISTED", "HIRED"];

  function StatusProgress({ status }) {
    const currentIndex = statusSteps.indexOf(status);
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        {statusSteps.map((step, idx) => (
          <div
            key={step}
            style={{ flex: 1, textAlign: "center", position: "relative" }}
          >
            <div
              style={{
                height: 20,
                width: 20,
                margin: "0 auto 8px",
                borderRadius: "50%",
                backgroundColor:
                  idx <= currentIndex ? statusColors[step] : "#ccc",
                zIndex: 2,
                position: "relative",
              }}
            />
            {idx < statusSteps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 9,
                  left: "50%",
                  height: 4,
                  width: "100%",
                  backgroundColor:
                    idx < currentIndex ? statusColors[step] : "#ccc",
                  zIndex: 1,
                }}
              />
            )}
            <small style={{ color: idx <= currentIndex ? "black" : "#666" }}>
              {step.replace("_", " ")}
            </small>
          </div>
        ))}
      </div>
    );
  }

  const params = new URLSearchParams(location.search);
  const selectedAppId = params.get("select");

  useEffect(() => {
    if (loadingUser) return;
    if (!user?.jobSeekerId) {
      setApps([]);
      return;
    }

    const fetchApplications = async () => {
      try {
        const appsRes = await api.get(
          `/applications/jobseeker/${user.jobSeekerId}`
        );
        const resumesRes = await api.get(
          `/resumes/jobseeker/${user.jobSeekerId}`
        );

        const resumeMap = {};
        resumesRes.data.forEach((r) => {
          resumeMap[r.filePath.split("/").pop()] = r.resumeId;
        });

        const jobsRes = await api.get("/joblistings");
        const jobsMap = {};
        jobsRes.data.forEach((j) => {
          jobsMap[j.jobListingId] = {
            title: j.title,
            companyName: j.companyName,
          };
        });

        const annotatedApps = appsRes.data.map((app) => {
          const filename = app.resumeFilePath?.split("/").pop();
          return {
            ...app,
            jobTitle: jobsMap[app.jobListingId]?.title || "Unknown",
            companyName:
              jobsMap[app.jobListingId]?.companyName || "Unknown Company",
            resumeId: filename ? resumeMap[filename] : null,
            applicationDate: app.applicationDate,
          };
        });

        annotatedApps.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );
        setApps(annotatedApps);
      } catch (err) {
        console.error("Failed to fetch applications", err);
        setApps([]);
      }
    };

    fetchApplications();
  }, [user?.jobSeekerId, loadingUser]);

  const viewResume = async (resumeId) => {
    try {
      const res = await api.get(`/resumes/download/${resumeId}?inline=true`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(res.data);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error ${err.response?.status}: ${err.response?.statusText}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const displayedApps = selectedAppId
    ? apps.filter((app) => String(app.applicationId) === selectedAppId)
    : apps;

  if (!displayedApps.length) return <p>No application found.</p>;

  return (
    <div className="container my-4" style={{ maxWidth: "900px" }}>
      <h3>Your Application{displayedApps.length > 1 ? "s" : ""}</h3>
      {displayedApps.map((app) => (
        <div
          key={app.applicationId}
          className="card p-3 mb-4 shadow-sm"
          style={{
            borderRadius: 12,
            cursor: "default",
            boxShadow: "none",
            position: "relative",
          }}
          tabIndex={0}
          aria-label={`Application for Job ${app.jobTitle}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h5 style={{ color: "#1976d2", fontWeight: 600, marginBottom: 0 }}>
              {app.jobTitle}
            </h5>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: 2,
                color: "#1976d2",
                fontSize: 20,
              }}
              title="View Job Details"
              aria-label="View Job Details"
              onClick={() => navigate(`/jobs/${app.jobListingId}`)}
            >
              <FaInfoCircle />
            </button>
          </div>
          <div
            style={{ color: "#353ea2", fontWeight: 500, marginBottom: "7px" }}
          >
            {app.companyName}
          </div>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: statusColors[app.status] || "black",
                fontWeight: "bold",
              }}
            >
              {app.status}
            </span>
          </p>
          <StatusProgress status={app.status} />
          <p>
            <strong>Applied On:</strong> {formatDate(app.applicationDate)}
          </p>
          {app.resumeId && (
            <div style={{ textAlign: "left", marginTop: "6px" }}>
              <button
                onClick={() => viewResume(app.resumeId)}
                style={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background 0.2s",
                  display: "inline-block",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#1565c0")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#1976d2")
                }
              >
                View Resume
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
