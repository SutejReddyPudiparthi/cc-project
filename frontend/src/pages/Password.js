import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Password({ isChangePassword = false, userEmail }) {
  const [step, setStep] = useState(isChangePassword ? "change" : "request");
  const [email, setEmail] = useState(userEmail || "");
  const [token, setToken] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (!isChangePassword) {
      const params = new URLSearchParams(location.search);
      const tokenFromUrl = params.get("token");
      if (tokenFromUrl) {
        setToken(tokenFromUrl);
        setStep("reset");
      }
    }
  }, [location.search, isChangePassword]);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(
        res.data.message || "Password reset link sent to your email.",
        { position: "top-right" }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to request password reset.",
        { position: "top-right" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.", {
        position: "top-right",
      });
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token.", { position: "top-right" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful!", {
        position: "top-right",
      });
      setStep("done");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.", {
        position: "top-right",
      });
      return;
    }

    if (!currentPassword) {
      toast.error("Current password is required.", { position: "top-right" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        email,
        currentPassword,
        newPassword,
      });
      toast.success(res.data.message || "Password changed successfully!", {
        position: "top-right",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", marginTop: "3rem" }}>
      {step === "request" && !isChangePassword && (
        <>
          <h3>Forgot Password</h3>
          <form onSubmit={handleForgotSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Processing..." : "Send Reset Link"}
            </button>
          </form>
        </>
      )}

      {step === "reset" && (
        <>
          <h3>Reset Password</h3>
          <form onSubmit={handleResetSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
      )}

      {step === "change" && isChangePassword && (
        <>
          <h3>Change Password</h3>
          <form onSubmit={handleChangeSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <div className="alert alert-success mt-5">
          Password reset successful! Redirecting to login page...
        </div>
      )}
    </div>
  );
}
