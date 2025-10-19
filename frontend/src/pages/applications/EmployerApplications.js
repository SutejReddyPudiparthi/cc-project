import React, { useEffect, useState } from "react";
import api from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_OPTIONS = [
  "APPLIED",
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];

export default function EmployerApplications() {
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ id: null, status: null });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedJobSeekerId, setSelectedJobSeekerId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileResumeId, setProfileResumeId] = useState(null);

  // 🔹 Filter states
  const [filterJobId, setFilterJobId] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const employerId = localStorage.getItem("employerId");
        if (!employerId) return;
        const jobsRes = await api.get("/joblistings");
        const employerJobs = jobsRes.data.filter(
          (j) => j.employerId === parseInt(employerId)
        );
        const jobIds = new Set(employerJobs.map((j) => j.jobListingId));
        const appsRes = await api.get("/applications");
        let apps = appsRes.data.filter((a) => jobIds.has(a.jobListingId));
        const seekerIds = [
          ...new Set(apps.map((a) => a.seekerId || a.jobSeekerId)),
        ];
        const resumeMap = {};
        for (const sId of seekerIds) {
          const resumesRes = await api.get(`/resumes/jobseeker/${sId}`);
          resumeMap[sId] = resumesRes.data;
        }
        const seekersMap = {};
        for (const sId of seekerIds) {
          try {
            const seekerRes = await api.get(`/jobseekers/${sId}`);
            seekersMap[sId] = seekerRes.data;
          } catch {
            seekersMap[sId] = null;
          }
        }
        apps = apps.map((app) => {
          const job = employerJobs.find(
            (j) => j.jobListingId === app.jobListingId
          );
          const seeker = seekersMap[app.seekerId || app.jobSeekerId];
          const seekerId = app.seekerId || app.jobSeekerId;
          const resumes = resumeMap[seekerId] || [];
          const primaryResume = resumes.find((r) => r.primary) || resumes[0];
          const resumeId = primaryResume ? primaryResume.resumeId : null;
          return {
            ...app,
            jobTitle: app.jobTitle || (job ? job.title : "-"),
            applicantName:
              app.applicantName || (seeker ? seeker.fullName : "-"),
            resumeId,
          };
        });

        apps.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        );
        setApplications(apps);
        setAllApplications(apps);
      } catch (err) {
        console.error("Error loading applications", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (showProfileModal && selectedJobSeekerId) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError(null);
        try {
          const res = await api.get(`/jobseekers/${selectedJobSeekerId}`);
          setProfile(res.data);
        } catch {
          setProfileError("Error loading job seeker profile.");
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
      setProfileError(null);
      setProfileResumeId(null);
    }
  }, [showProfileModal, selectedJobSeekerId]);

  const handleStatusSelect = (id, status) => {
    setStatusUpdate({ id, status });
  };

  const updateStatus = async () => {
    const { id, status } = statusUpdate;
    if (!id || !status) return;
    const app = applications.find((a) => a.applicationId === id);
    if (!app) return;
    const payload = {
      applicationId: app.applicationId,
      jobListingId: app.jobListingId,
      jobSeekerId: app.jobSeekerId,
      status,
      resumeFilePath: app.resumeFilePath || "",
      jobTitle: app.jobTitle || "",
      applicantName: app.applicantName || "",
      applicationDate: app.applicationDate,
    };
    try {
      await api.put("/applications", payload);
      setApplications((apps) =>
        apps.map((a) => (a.applicationId === id ? { ...a, status } : a))
      );
      setStatusUpdate({ id: null, status: null });
      toast.success(
        `Application #${app.applicationId} status updated to "${status}"`
      );
    } catch (err) {
      toast.error(
        `Error ${err.response?.status}: ${err.response?.data || err.message}`
      );
    }
  };

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

  const viewProfile = (jobSeekerId, resumeId) => {
    setSelectedJobSeekerId(jobSeekerId);
    setShowProfileModal(true);
    setProfileResumeId(resumeId || null);
  };

  const closeProfileModal = () => {
    setSelectedJobSeekerId(null);
    setShowProfileModal(false);
    setProfileResumeId(null);
  };

  // 🔹 Filter applications
  useEffect(() => {
    let filtered = [...allApplications];
    if (filterJobId) {
      filtered = filtered.filter(
        (app) => app.jobListingId.toString() === filterJobId
      );
    }
    if (filterJobTitle) {
      filtered = filtered.filter((app) => app.jobTitle === filterJobTitle);
    }
    setApplications(filtered);
  }, [filterJobId, filterJobTitle, allApplications]);

  const clearFilters = () => {
    setFilterJobId("");
    setFilterJobTitle("");
    setApplications(allApplications);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container my-4" style={{ maxWidth: "900px" }}>
      <h3>Applications To Your Jobs</h3>

      {/* 🔹 Filter Card */}
      <div className="card shadow-sm p-3 mb-4" style={{ borderRadius: 10 }}>
        <h6 className="fw-bold mb-3">Filter Applications</h6>
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div>
            <label className="me-2 fw-bold">Job ID:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "200px", display: "inline-block" }}
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(allApplications.map((app) => app.jobListingId))].map(
                (id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="me-2 fw-bold">Role:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "250px", display: "inline-block" }}
              value={filterJobTitle}
              onChange={(e) => setFilterJobTitle(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(allApplications.map((app) => app.jobTitle))].map(
                (title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {applications.length === 0 && <p>No applications found.</p>}

      {applications.map((app) => (
        <div
          key={app.applicationId}
          className="card p-3 mb-4 shadow-sm"
          style={{ borderRadius: 12, cursor: "default" }}
        >
          <div className="d-flex justify-content-between align-items-start flex-column flex-md-row">
            <div>
              <h5 style={{ color: "#1976d2" }}>
                Application #{app.applicationId}
              </h5>
              <p style={{ fontSize: "1.1rem" }}>
                <b>Job Title:</b> {app.jobTitle || "-"}{" "}
                <span style={{ marginLeft: "40px", fontSize: "1.1rem" }}>
                  <b>Applicant:</b> {app.applicantName || "-"}
                </span>
              </p>
              <p>
                <b>Status:</b> {app.status}
              </p>
            </div>

            <div className="mt-3 mt-md-0 d-flex flex-column align-items-start align-items-md-end gap-2">
              <select
                className="form-select"
                style={{ width: "150px" }}
                value={
                  statusUpdate.id === app.applicationId
                    ? statusUpdate.status || app.status
                    : app.status
                }
                onChange={(e) =>
                  handleStatusSelect(app.applicationId, e.target.value)
                }
                aria-label={`Change status for application ${app.applicationId}`}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {statusUpdate.id === app.applicationId &&
                statusUpdate.status &&
                statusUpdate.status !== app.status && (
                  <button
                    className="btn btn-success btn-sm mt-2"
                    onClick={updateStatus}
                  >
                    Confirm Status
                  </button>
                )}

              <button
                className="btn btn-outline-info"
                onClick={() => viewProfile(app.jobSeekerId, app.resumeId)}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      ))}

      {showProfileModal && selectedJobSeekerId && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0,0,0,0.36)",
            position: "fixed",
            inset: 0,
            zIndex: 1060,
          }}
        >
          <div
            className="modal-dialog modal-lg"
            style={{
              maxWidth: 700,
              width: "90%",
              margin: "2rem auto",
            }}
          >
            <div
              className="modal-content"
              style={{
                border: "2px solid #1976d2",
                borderRadius: 14,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxHeight: "80vh",
                overflowY: "auto",
                background: "#fff",
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title">
                  Job Seeker Profile (ID: {selectedJobSeekerId})
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeProfileModal}
                />
              </div>
              <div
                className="modal-body"
                style={{
                  overflowY: "auto",
                  borderRadius: 12, // Must match modal's border radius
                  paddingRight: 12,
                  maxHeight: "65vh", // a bit less than content, to keep header visible when scrolled
                }}
              >
                {profileLoading && <div>Loading...</div>}
                {profileError && (
                  <div className="text-danger">{profileError}</div>
                )}
                {profile && (
                  <div>
                    <b>Name:</b> {profile.fullName}
                    <br />
                    <b>Email:</b> {profile.email}
                    <br />
                    <b>Phone:</b> {profile.phone}
                    <br />
                    <b>Gender:</b> {profile.gender}
                    <br />
                    <b>Date of Birth:</b> {profile.dateOfBirth}
                    <br />
                    <b>Address:</b> {profile.address}
                    <br />
                    <b>About Me:</b> {profile.aboutMe}
                    <br />
                    <b>Skills:</b> {profile.skills}
                    <br />
                    <b>Experience:</b> {profile.experience}
                    <br />
                    {/* Education */}
                    <div className="mt-2">
                      <b>Education:</b>
                      {profile.educationDetails &&
                      profile.educationDetails.length > 0 ? (
                        <ul>
                          {profile.educationDetails.map((edu, i) => (
                            <li key={i}>
                              {edu.level} @ {edu.institutionName}{" "}
                              {edu.stream && <> (Stream: {edu.stream})</>}
                              <br />
                              {edu.startYear} - {edu.endYear}, {edu.location}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> - </span>
                      )}
                    </div>
                    {/* Certificates */}
                    <div className="mt-2">
                      <b>Certificates:</b>
                      {profile.certificates &&
                      profile.certificates.length > 0 ? (
                        <ul>
                          {profile.certificates.map((cert, i) => (
                            <li key={i}>
                              {cert.certificateName} ({cert.organization})<br />
                              {cert.startDate || "?"} - {cert.endDate || "?"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> - </span>
                      )}
                    </div>
                    {/* Projects */}
                    <div className="mt-2">
                      <b>Projects:</b>
                      {profile.projects && profile.projects.length > 0 ? (
                        <ul>
                          {profile.projects.map((proj, i) => (
                            <li key={i}>
                              <b>{proj.projectName}:</b> {proj.description}
                              {proj.link && (
                                <>
                                  {" "}
                                  <a
                                    href={proj.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    [link]
                                  </a>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> - </span>
                      )}
                    </div>
                    {/* Social Links */}
                    <div className="mt-2">
                      <b>Social Links:</b>
                      {profile.socialLinks && profile.socialLinks.length > 0 ? (
                        <ul>
                          {profile.socialLinks.map((soc, i) => (
                            <li key={i}>
                              {soc.platform}:{" "}
                              <a
                                href={soc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {soc.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span> - </span>
                      )}
                    </div>
                    {profileResumeId && (
                      <button
                        className="btn btn-outline-primary mt-3"
                        onClick={() => viewResume(profileResumeId)}
                      >
                        View Resume
                      </button>
                    )}
                  </div>
                )}
                {!profileLoading && !profileError && !profile && (
                  <div>No profile data found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
