import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const JobSeekerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [savedJobsIds, setSavedJobsIds] = useState([]);
  const [jobsList, setJobsList] = useState([]);

  useEffect(() => {
    if (!user?.jobSeekerId) {
      setLoading(false);
      setProfile(null);
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Fetch profile and recommendations in parallel
        const [profileRes, recommendedRes] = await Promise.all([
          api.get(`/jobseekers/${user.jobSeekerId}`),
          api.get(`/jobseekers/${user.jobSeekerId}/recommendations`),
        ]);

        setProfile(profileRes.data);
        setRecommendedJobs(recommendedRes.data);

        // Fetch only saved jobs if any
        const saved = localStorage.getItem("savedJobs");
        const savedArr = saved ? JSON.parse(saved) : [];
        if (savedArr.length > 0) {
          const savedJobsRes = await api.get(
            `/joblistings?ids=${savedArr.join(",")}`
          );
          setSavedJobsIds(savedJobsRes.data); // directly store full job objects
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div
        className="container my-4"
        style={{ maxWidth: 900, textAlign: "center" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ maxWidth: 900 }}>
      <h2>Welcome back, {profile?.fullName || user.email}!</h2>
      <section className="mb-4 p-3 border rounded shadow-sm">
        <h4>Recommended Jobs ({recommendedJobs.length})</h4>
        {recommendedJobs.length === 0 ? (
          <p>No recommendations available currently.</p>
        ) : (
          <ul className="list-group">
            {recommendedJobs.slice(0, 5).map((job) => (
              <li key={job.jobListingId} className="list-group-item">
                <Link to={`/jobs/${job.jobListingId}`}>{job.title}</Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/recommendations" className="btn btn-link mt-2">
          View All Recommendations
        </Link>
      </section>
      <section className="mb-4 p-3 border rounded shadow-sm">
        <h4>Resume</h4>
        <p>
          Manage your resumes here.
          <Link to="/resumes" className="btn btn-primary ms-2">
            Go to Resume Manager
          </Link>
        </p>
      </section>
      <section className="mb-4 p-3 border rounded shadow-sm">
        <h4>Saved Jobs ({savedJobsIds.length})</h4>
        {savedJobsIds.length === 0 ? (
          <p>No saved jobs yet.</p>
        ) : (
          <ul className="list-group">
            {savedJobsIds.map((jobId) => {
              const job = jobsList.find((j) => j.jobListingId === jobId);
              if (!job) return null;
              return (
                <li
                  key={job.jobListingId}
                  className="list-group-item d-flex justify-content-between"
                >
                  <Link to={`/jobs/${job.jobListingId}`}>{job.title}</Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default JobSeekerDashboard;
