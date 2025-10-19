import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import {
  FaSearch,
  FaBars,
  FaBell,
  FaSignInAlt,
  FaThList,
  FaUserPlus,
  FaClipboardList,
  FaPlusCircle,
} from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import logo from "../assets/Brand_Logo.png";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";

const Navbar = () => {
  const { user, logout, loadingUser, unreadCount } = useContext(AuthContext);
  const isLoggedIn = user?.loggedIn || false;
  const role = user?.role || "";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to perform a search.");
      return;
    }
    if (!user || user.role === "JOBSEEKER") {
      navigate(`/jobs?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const handleBellClick = () => navigate("/notifications");

  const handleLogout = () => {
    logout();
    closeSidebar();
    toast.info("Logged out successfully!");
    navigate("/");
  };

  if (loadingUser) {
    return (
      <nav
        className="navbar d-flex align-items-center px-4"
        style={{
          background: "#fff",
          justifyContent: "space-between",
          height: 70,
        }}
      ></nav>
    );
  }

  return (
    <>
      <nav
        className="navbar d-flex align-items-center px-4"
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          minHeight: "76px",
        }}
      >
        <Link
          to="/"
          style={{
            fontWeight: "700",
            fontSize: "1.5em",
            color: "#1976d2",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="CareerCrafter Logo"
            style={{
              height: "48px",
              maxHeight: "70px",
              width: "auto",
              objectFit: "contain",
              marginRight: "10px",
              display: "block",
            }}
          />
        </Link>

        {role !== "EMPLOYER" && (
          <form
            onSubmit={handleSearch}
            style={{
              flex: 2,
              display: "flex",
              justifyContent: "center",
            }}
            autoComplete="off"
          >
            <div
              style={{
                position: "relative",
                width: 450,
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaSearch
                style={{
                  position: "absolute",
                  left: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1976d2",
                  fontSize: "1.3em",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, location, company, required skills"
                className="form-control"
                style={{
                  width: "100%",
                  borderRadius: "2em",
                  paddingLeft: "3.5em",
                  paddingRight: "3.5em",
                  fontSize: "1em",
                  boxShadow: searchFocus
                    ? "0 0 0 3px rgba(25, 118, 210, 0.18)"
                    : "0 2px 8px rgba(0,0,0,0.10)",
                  border: searchFocus
                    ? "1.5px solid #1976d2"
                    : "1px solid #eaeaea",
                  background: "#fafafb",
                  transition: "box-shadow 0.3s, border 0.2s",
                  outline: "none",
                  height: "45px",
                }}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />

              {searchTerm && (
                <span
                  onClick={() => {
                    setSearchTerm(""); // clear search
                    navigate("/jobs"); // show all jobs
                  }}
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "1em",
                    color: "#888",
                    userSelect: "none",
                    padding: "1.7px",
                    borderRadius: "50%",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#1976d2";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#888";
                  }}
                  onTouchStart={(e) => {
                    e.target.style.background = "#1976d2";
                    e.target.style.color = "#fff";
                  }}
                  onTouchEnd={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#888";
                  }}
                >
                  X
                </span>
              )}
            </div>
          </form>
        )}

        <div
          className="nav-links d-flex align-items-center"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: "1.15rem",
                  padding: "8px 18px",
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: "700",
                  borderRadius: "22px",
                  transition: "background 0.2s",
                }}
              >
                <FaSignInAlt /> Login
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: "1.15rem",
                  padding: "8px 18px",
                  color: "#1976d2",
                  textDecoration: "none",
                  fontWeight: "700",
                  borderRadius: "22px",
                  transition: "background 0.2s",
                }}
              >
                <FaUserPlus /> Register
              </Link>
            </>
          )}

          {isLoggedIn && role === "JOBSEEKER" && (
            <>
              <Link
                to="/jobs"
                style={{
                  fontSize: "1rem",
                  padding: "8px 16px",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                <FaThList /> Job Listings
              </Link>
              <Link
                to="/my-applications"
                style={{
                  fontSize: "1rem",
                  padding: "8px 16px",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                <FaClipboardList /> My Applications
              </Link>

              {/* Notification Bell */}
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={handleBellClick}
              >
                <FaBell style={{ fontSize: "1.5rem", color: "#1976d2" }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </>
          )}

          {isLoggedIn && role === "EMPLOYER" && (
            <>
              <Link
                to="/employer/dashboard"
                style={{
                  fontSize: "1rem",
                  padding: "8px 16px",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                <MdDashboardCustomize /> Dashboard
              </Link>
              <Link
                to="/employer/post-job"
                style={{
                  fontSize: "1rem",
                  padding: "8px 16px",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                <FaPlusCircle /> Post a Job
              </Link>
              <Link
                to="/applications/employer"
                style={{
                  fontSize: "1rem",
                  padding: "8px 16px",
                  color: "#333",
                  textDecoration: "none",
                  fontWeight: "600",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#1976d2")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                <FaClipboardList /> Employer Applications
              </Link>

              {/* Notification Bell */}
              <div
                style={{ position: "relative", cursor: "pointer" }}
                onClick={handleBellClick}
              >
                <FaBell style={{ fontSize: "1.5rem", color: "#1976d2" }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      background: "red",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "1px 5px",
                      fontSize: "0.65rem",
                      fontWeight: "700",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Hamburger Menu Icon */}
          {isLoggedIn && (
            <FaBars
              className="hamburger-icon"
              onClick={toggleSidebar}
              style={{
                fontSize: "1.5rem",
                color: "#1976d2",
                cursor: "pointer",
                marginLeft: "1rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#1565c0")}
              onMouseLeave={(e) => (e.target.style.color = "#1976d2")}
              aria-label="Open Menu"
            />
          )}
        </div>
      </nav>

      {isLoggedIn && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
    </>
  );
};

export default Navbar;
