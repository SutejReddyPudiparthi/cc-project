import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaBriefcase,
  FaUserTie,
  FaFileUpload,
  FaSearch,
  FaCheckCircle,
  FaUserCheck,
  FaClipboardList,
  FaTasks,
} from "react-icons/fa";
import backgroundImg from "../assets/Home.jpg";
import { AuthContext } from "../auth/AuthContext"; // ADD THIS LINE

const ICON_STYLE = { fontSize: "2.5rem", color: "#1976d2" };
const TEXT_STYLE = {
  marginTop: 10,
  color: "#1976d2",
  fontWeight: "600",
  fontSize: "1.15rem",
  lineHeight: 1.3,
};

const jobseekerSteps = [
  { icon: <FaUserTie style={ICON_STYLE} />, text: "Register / Signup" },
  { icon: <FaFileUpload style={ICON_STYLE} />, text: "Upload Your Resume" },
  { icon: <FaSearch style={ICON_STYLE} />, text: "Find & Apply for Jobs" },
  { icon: <FaCheckCircle style={ICON_STYLE} />, text: "Get Hired!" },
];

const employerSteps = [
  { icon: <FaUserCheck style={ICON_STYLE} />, text: "Register / Login" },
  { icon: <FaClipboardList style={ICON_STYLE} />, text: "Post a Job" },
  { icon: <FaTasks style={ICON_STYLE} />, text: "Manage Applications" },
  { icon: <FaCheckCircle style={ICON_STYLE} />, text: "Hire the Best!" },
];

export default function Home() {
  const [infoVisible, setInfoVisible] = useState(false);
  const infoCardRef = useRef(null);
  const { user } = useContext(AuthContext); // ADD THIS LINE

  const toggleInfoCard = () => {
    setInfoVisible(!infoVisible);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (infoCardRef.current && !infoCardRef.current.contains(event.target)) {
        setInfoVisible(false);
      }
    }
    if (infoVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [infoVisible]);

  // Helper checks
  const isJobSeeker = user && user.role === "JOBSEEKER";
  const isEmployer = user && user.role === "EMPLOYER";
  const showBoth = !user || (!isJobSeeker && !isEmployer);

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "90vh",
        background: "#f8f9fa",
        padding: "2rem 1rem",
        backgroundImage: `url(${backgroundImg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* === Combined Title Card === */}
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          padding: "2rem 3rem",
          borderRadius: "15px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          textAlign: "center",
          marginBottom: "2.5rem",
          maxWidth: "700px",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "#173355",
            marginBottom: "0.8rem",
            letterSpacing: "0.02em",
          }}
        >
          CareerCrafter
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "#1976d2",
            margin: 0,
            fontWeight: "500",
            letterSpacing: "0.01em",
          }}
        >
          Find the best jobs or hire top talent with ease.
        </p>
      </div>
      {/* === End Combined Card === */}

      {/* === Browse Jobs Button (Only for Job Seekers) === */}
      {isJobSeeker && (
        <Link
          to="/jobs"
          className="btn btn-primary btn-lg mb-5 px-4 py-2 rounded-pill shadow-sm"
          style={{ fontWeight: "500", letterSpacing: "0.02em" }}
        >
        <FaSearch/>  Browse Jobs
        </Link>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          maxWidth: 660,
          margin: "0 auto 2.5rem",
        }}
      >
        {/* JOB SEEKER STRIP: Only show to jobseeker or guest */}
        {(isJobSeeker || showBoth) && (
          <div
            className="card shadow-sm p-3 d-flex flex-column align-items-center justify-content-center text-center"
            style={{
              width: "320px",
              minHeight: "190px",
              borderRadius: "14px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <FaUser size={40} color="#2471A3" />
            <h5 className="mt-3 mb-2" style={{ color: "#34495E" }}>
              For Job Seekers
            </h5>
            <ul
              className="list-unstyled mb-0"
              style={{ fontSize: "1rem", color: "#566573", paddingLeft: 0 }}
            >
              <li>✔ Easy application process</li>
              <li>✔ Personalized job recommendations</li>
              <li>✔ Resume upload & tracking</li>
            </ul>
          </div>
        )}

        {/* EMPLOYER STRIP: Only show to employer or guest */}
        {(isEmployer || showBoth) && (
          <div
            className="card shadow-sm p-3 d-flex flex-column align-items-center justify-content-center text-center"
            style={{
              width: "320px",
              minHeight: "190px",
              borderRadius: "14px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <FaBriefcase size={40} color="#2471A3" />
            <h5 className="mt-3 mb-2" style={{ color: "#34495E" }}>
              For Employers
            </h5>
            <ul
              className="list-unstyled mb-0"
              style={{ fontSize: "1rem", color: "#566573", paddingLeft: 0 }}
            >
              <li>✔ Post jobs easily</li>
              <li>✔ Manage Applications</li>
              <li>✔ Analytics dashboard</li>
            </ul>
          </div>
        )}
      </div>

      {/* Combined Card Without Badges */}
      <section
        style={{
          width: "100%",
          maxWidth: 900,
          background: "#f8faff",
          borderRadius: 20,
          padding: "2.5rem 1rem",
          boxShadow: "0 1px 6px rgba(25,118,210,0.07)",
          marginBottom: "3rem",
        }}
      >
        <h2
          style={{
            color: "#1976d2",
            marginBottom: "2.2rem",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          How CareerCrafter Works
        </h2>

        {/* Job Seekers row */}
        {(isJobSeeker || showBoth) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "4rem", // evenly spaced
              marginBottom: "3rem",
              flexWrap: "wrap",
            }}
          >
            {jobseekerSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  minWidth: 160,
                  fontSize: "1rem",
                }}
              >
                <div>{step.icon}</div>
                <div style={TEXT_STYLE}>{step.text}</div>
                <div
                  style={{
                    margin: "0 auto",
                    width: 35,
                    height: 12,
                    borderBottom: "2px dashed #1976d2",
                    marginTop: 10,
                    visibility:
                      idx === jobseekerSteps.length - 1 ? "hidden" : "visible",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Employers row */}
        {(isEmployer || showBoth) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "4rem",
              marginBottom: "3rem",
              flexWrap: "wrap",
            }}
          >
            {employerSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  minWidth: 160,
                  fontSize: "1rem",
                }}
              >
                <div>{step.icon}</div>
                <div style={TEXT_STYLE}>{step.text}</div>
                <div
                  style={{
                    margin: "0 auto",
                    width: 35,
                    height: 12,
                    borderBottom: "2px dashed #1976d2",
                    marginTop: 10,
                    visibility:
                      idx === employerSteps.length - 1 ? "hidden" : "visible",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={toggleInfoCard}
        style={{
          padding: "12px 28px",
          fontSize: "1.15rem",
          fontWeight: "700",
          color: "#fff",
          backgroundColor: "#1976d2",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          boxShadow: "0 6px 10px rgba(25, 118, 210, 0.3)",
          transition: "transform 0.25s ease, background-color 0.25s ease",
          marginBottom: "2rem",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#1565c0";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1976d2";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-expanded={infoVisible}
        aria-controls="career-info-card"
      >
        About CareerCrafter
      </button>

      {infoVisible && (
        <div
          ref={infoCardRef}
          id="career-info-card"
          role="region"
          aria-live="polite"
          style={{
            maxWidth: 600,
            backgroundColor: "#fff",
            boxShadow: "0 8px 20px rgba(25,118,210,0.15)",
            borderRadius: 12,
            padding: "1.8rem 2rem",
            color: "#34495e",
            fontSize: "1.05rem",
            lineHeight: 1.5,
            textAlign: "center",
            userSelect: "text",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: "#1976d2", marginBottom: "1rem" }}>
            What is CareerCrafter?
          </h3>
          <p>
            CareerCrafter is your one-stop platform to find the best job
            opportunities. If you are a job seeker looking for personalized
            recommendations or an employer seeking skilled talent, CareerCrafter
            helps in hiring process with an easy-to-use interface, resume
            management. Empower your job search or recruitment journey today!
          </p>
        </div>
      )}
    </div>
  );
}
