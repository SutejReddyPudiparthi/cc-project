import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import {
  FaTimes,
  FaUser,
  FaUserEdit,
  FaTrashAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoCreateOutline } from "react-icons/io5";
import { MdDashboardCustomize, MdOutlineChangeCircle } from "react-icons/md";
import { getJobSeekerByUserId, getEmployerByUserId } from "../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role || "";
  const userId = user?.userId;

  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!userId) return;
      try {
        let res;
        if (role === "JOBSEEKER") {
          res = await getJobSeekerByUserId(userId);
        } else {
          res = await getEmployerByUserId(userId);
        }
        setHasProfile(!!res.data);
      } catch {
        setHasProfile(false);
      }
    }
    checkProfile();
  }, [role, userId]);

  const handleLogout = () => {
    logout();
    onClose();
    toast.info("Logged out successfully!");
    navigate("/");
  };

  const handleNavigate = (path, state, toastMessage) => {
    onClose();
    navigate(path, { state, replace: false, key: Date.now() });
    if (toastMessage) {
      toast.success(toastMessage, { toastId: toastMessage });
    }
  };

  return (
    <>
      <div
        className={`overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s, visibility 0.3s",
          zIndex: 998,
        }}
      />
      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-320px",
          width: "320px",
          height: "100vh",
          backgroundColor: "#fff",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
          transition: "right 0.3s",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            backgroundColor: "#1976d2",
            color: "#fff",
          }}
        >
          <h3 style={{ margin: 0 }}>Menu</h3>
          <FaTimes
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: "1.5rem" }}
          />
        </header>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {role === "JOBSEEKER" && (
            <>
              {!hasProfile ? (
                <button
                  onClick={() =>
                    handleNavigate("/profile/jobseeker", { mode: "create" })
                  }
                  style={linkStyle}
                >
                  <IoCreateOutline /> Create Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleNavigate("/profile/jobseeker", { mode: "view" })
                    }
                    style={linkStyle}
                  >
                    <FaUser /> My Profile
                  </button>
                  <button
                    onClick={() =>
                      handleNavigate("/profile/jobseeker", { mode: "edit" })
                    }
                    style={linkStyle}
                  >
                    <FaUserEdit /> Edit Profile
                  </button>
                </>
              )}
              <button
                onClick={() => handleNavigate("/jobseeker/dashboard")}
                style={linkStyle}
              >
                <MdDashboardCustomize /> Dashboard
              </button>
            </>
          )}
          {role === "EMPLOYER" && (
            <>
              {!hasProfile ? (
                <button
                  onClick={() =>
                    handleNavigate("/profile/employer", { mode: "create" })
                  }
                  style={linkStyle}
                >
                  <IoCreateOutline /> Create Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleNavigate("/profile/employer", { mode: "view" })
                    }
                    style={linkStyle}
                  >
                    <FaUser /> My Profile
                  </button>
                  <button
                    onClick={() =>
                      handleNavigate("/profile/employer", { mode: "edit" })
                    }
                    style={linkStyle}
                  >
                    <FaUserEdit /> Edit Profile
                  </button>
                </>
              )}
            </>
          )}
          <div style={sectionStyle}>Account Settings</div>
          <button
            style={linkStyle}
            onClick={() => {
              onClose();
              navigate("/change-password");
            }}
          >
            <MdOutlineChangeCircle style={{ marginRight: 8 }} />
            Change Password
          </button>

          <button
            style={linkStyle}
            onClick={() => {
              onClose();
              navigate("/delete-account");
            }}
          >
            <FaTrashAlt style={{ marginRight: 8 }} />
            Delete Account
          </button>
          <button onClick={handleLogout} style={logoutStyle}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

const linkStyle = {
  background: "none",
  border: "none",
  textAlign: "left",
  display: "block",
  width: "100%",
  padding: "0.75rem 1.5rem",
  color: "#333",
  fontSize: "1rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.2s",
};

const sectionStyle = {
  padding: "0.75rem 1.5rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
};

const logoutStyle = {
  margin: "auto 1.5rem 1.5rem",
  padding: "0.75rem",
  width: "calc(100% - 3rem)",
  backgroundColor: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: 600,
  cursor: "pointer",
};
