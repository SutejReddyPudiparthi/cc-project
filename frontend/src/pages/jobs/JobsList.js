import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { MdBookmark, MdBookmarkBorder } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const jobTypeList = ["", "FULL_TIME", "PART_TIME", "INTERNSHIP"];

const defaultFilters = {
  role: "",
  skill: "",
  location: "",
  experience: "",
  jobType: "",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [sortMode, setSortMode] = useState("date");
  const { user } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState(getSavedJobsFromStorage());
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query")?.trim().toLowerCase() || "";
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10; // number of jobs per page

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (user?.role === "JOB_SEEKER" && user.jobSeekerId) {
        try {
          const res = await api.get(
            `/applications/jobseeker/${user.jobSeekerId}`
          );
          setAppliedJobs(res.data.map((app) => app.jobListingId));
        } catch (err) {
          console.error("Failed to fetch applied jobs", err);
        }
      }
    };

    const loadJobs = async () => {
      try {
        setLoading(true);
        let res;
        if (
          sortMode === "recommended" &&
          user?.role === "JOB_SEEKER" &&
          user.jobSeekerId
        ) {
          res = await api.get(
            `/jobseekers/${user.jobSeekerId}/recommendations`
          );
          console.log("Recommended jobs received:", res.data);
        } else {
          res = await api.get("/joblistings");
        }
        setJobs(
          res.data
            .filter((job) => job.active)
            .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
        );
        await fetchAppliedJobs();
      } catch (err) {
        console.error("Error loading jobs", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, sortMode]);

  function getSavedJobsFromStorage() {
    const saved = localStorage.getItem("savedJobs");
    return saved ? JSON.parse(saved) : [];
  }

  function saveJobToStorage(jobId) {
    const saved = getSavedJobsFromStorage();
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      localStorage.setItem("savedJobs", JSON.stringify(saved));
    }
  }

  function removeJobFromStorage(jobId) {
    let saved = getSavedJobsFromStorage();
    saved = saved.filter((id) => id !== jobId);
    localStorage.setItem("savedJobs", JSON.stringify(saved));
  }

  const handleSave = (jobId) => {
    if (savedJobs.includes(jobId)) {
      removeJobFromStorage(jobId);
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
      toast.info("Job removed from saved list.");
    } else {
      saveJobToStorage(jobId);
      setSavedJobs([...savedJobs, jobId]);
      toast.success("Job saved successfully!");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = async () => {
    setFilters(defaultFilters);
    setLoading(true);
    try {
      const res = await api.get("/joblistings");
      setJobs(
        res.data
          .filter((job) => job.active)
          .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
      );
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      const res = await api.get(`/joblistings/filter?${params.toString()}`);
      setJobs(
        res.data
          .filter((job) => job.active)
          .sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate))
      );
    } catch (err) {
      console.error("Error filtering jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs
    .filter((job) => {
      if (!query) return true;
      return (
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.companyName?.toLowerCase().includes(query) ||
        job.requiredSkills?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortMode === "date") {
        if (!a.postedDate || !b.postedDate) return 0;
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      return 0;
    });

  if (loading) {
    return (
      <div
        className="container my-4"
        style={{ maxWidth: "1200px", textAlign: "center", marginTop: "4rem" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  const totalJobs = filteredJobs.length;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const start = totalJobs === 0 ? 0 : indexOfFirstJob + 1;
  const end = Math.min(indexOfLastJob, totalJobs);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  // ✅ Updated message logic for "Recommended" mode
  if (filteredJobs.length === 0) {
    const message =
      sortMode === "recommended"
        ? "No recommended jobs found based on your skills or location."
        : "No jobs found matching your search.";

    return (
      <div
        className="container my-4"
        style={{ maxWidth: "1200px", textAlign: "center", marginTop: "4rem" }}
      >
        <span style={{ fontSize: 44, color: "#1976d2" }}>🕵️‍♂️</span>
        <div style={{ marginTop: 18, fontWeight: 500, fontSize: 20 }}>
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ maxWidth: "1200px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "30px" }}>
        {/* Sidebar Filters */}
        <aside
          style={{
            minWidth: 320,
            maxWidth: 350,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(80,80,110,0.09)",
            padding: "28px 18px 20px 18px",
            height: "fit-content",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
            All Filters
          </div>
          <form
            onSubmit={handleFilterSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <label
                style={{ fontWeight: 600, marginBottom: 5, display: "block" }}
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location"
                className="form-control"
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e1ea",
                  fontSize: 16,
                  height: 48,
                  marginBottom: 0,
                }}
              />
            </div>
            <div>
              <label
                style={{ fontWeight: 600, marginBottom: 5, display: "block" }}
              >
                Role
              </label>
              <input
                type="text"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                placeholder="Role"
                className="form-control"
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e1ea",
                  fontSize: 16,
                  height: 48,
                }}
              />
            </div>
            <div>
              <label
                style={{ fontWeight: 600, marginBottom: 5, display: "block" }}
              >
                Skill
              </label>
              <input
                type="text"
                name="skill"
                value={filters.skill}
                onChange={handleFilterChange}
                placeholder="Skill"
                className="form-control"
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e1ea",
                  fontSize: 16,
                  height: 48,
                }}
              />
            </div>
            <div>
              <label
                style={{ fontWeight: 600, marginBottom: 5, display: "block" }}
              >
                Max Experience
              </label>
              <input
                type="number"
                name="experience"
                value={filters.experience}
                onChange={handleFilterChange}
                placeholder="Max Experience"
                className="form-control"
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e1ea",
                  fontSize: 16,
                  height: 48,
                }}
              />
            </div>
            <div>
              <label
                style={{ fontWeight: 600, marginBottom: 5, display: "block" }}
              >
                Job Type
              </label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="form-select"
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e0e1ea",
                  fontSize: 16,
                  height: 48,
                }}
              >
                {jobTypeList.map((type) => (
                  <option key={type} value={type}>
                    {type === "" ? "Job Type" : type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  height: 48,
                  background: "#1976d2",
                  border: "none",
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  height: 48,
                  border: "none",
                  borderRadius: 8,
                  background: "#eee",
                  color: "#222",
                  flex: 1,
                }}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </form>
        </aside>

        {/* Main Job Listings */}
        <main style={{ flexGrow: 1 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0" style={{ fontWeight: 600, fontSize: 22 }}>
              {sortMode === "recommended"
                ? "Recommended Jobs for You"
                : "All Job Listings"}
            </h2>
            <div>
              <label
                style={{
                  marginRight: 8,
                  fontWeight: "500",
                  color: "#1976d2",
                }}
              >
                Sort:
              </label>
              <select
                className="form-select d-inline-block"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                style={{ width: 170, display: "inline-block" }}
              >
                <option value="date">Date</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>
          </div>

          {/* ✅ Pagination info text */}
          <div className="mb-3 text-muted" style={{ fontSize: 15 }}>
            Showing {start}–{end} of {totalJobs} jobs
          </div>

          {currentJobs.map((job) => (
            <div
              key={job.jobListingId}
              className="card p-3 mb-4 shadow-sm"
              style={{
                borderRadius: 18,
                cursor: "pointer",
                boxShadow: "0 2px 18px rgba(27,55,67,.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 32px rgba(27,55,67,.14)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 18px rgba(27,55,67,.06)")
              }
            >
              <button
                onClick={() => handleSave(job.jobListingId)}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  border: "none",
                  background: "transparent",
                  color: "#1976d2",
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "1.5em",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                aria-label={
                  savedJobs.includes(job.jobListingId)
                    ? "Unsave Job"
                    : "Save Job"
                }
                title={
                  savedJobs.includes(job.jobListingId)
                    ? "Unsave Job"
                    : "Save Job"
                }
              >
                {savedJobs.includes(job.jobListingId) ? (
                  <MdBookmark style={{ color: "#1976d2" }} />
                ) : (
                  <MdBookmarkBorder style={{ color: "#1976d2" }} />
                )}
              </button>

              <h4
                style={{ color: "#1976d2", fontWeight: 600, marginBottom: 6 }}
              >
                {job.title}
              </h4>
              <span style={{ color: "#606b7b", fontSize: 18, fontWeight: 500 }}>
                {job.companyName}
              </span>
              <div
                style={{
                  fontSize: 15,
                  margin: "10px 0 2px 0",
                  color: "#374151",
                }}
              >
                {job.experience ?? "0"}-Yrs{" "}
                <span style={{ margin: "0 7px" }}>•</span> {job.location}{" "}
                <span style={{ margin: "0 7px" }}>•</span>{" "}
                {formatDate(job.postedDate)}
              </div>
              <div style={{ color: "#666", margin: "2px 0 8px 0" }}>
                {job.description?.slice(0, 130)}
                {job.description && job.description.length > 130 && "..."}
              </div>

              <div style={{ fontSize: 14, color: "#517fff", marginBottom: 5 }}>
                {job.requiredSkills}
              </div>

              {appliedJobs.includes(job.jobListingId) && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 58,
                    backgroundColor: "#5cb85c",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                  }}
                >
                  Applied
                </div>
              )}

              <Link
                to={`/jobs/${job.jobListingId}`}
                className="btn btn-outline-primary"
                style={{ borderRadius: 7, alignSelf: "flex-end", marginTop: 5 }}
              >
                View Details
              </Link>
            </div>
          ))}

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div
              className="d-flex justify-content-center mt-4"
              style={{ gap: 8 }}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`btn ${
                    currentPage === i + 1
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  style={{
                    borderRadius: 8,
                    width: 38,
                    height: 38,
                    padding: 0,
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobsList;
