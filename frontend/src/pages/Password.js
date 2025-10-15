import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";

export default function Password({ isChangePassword = false, userEmail }) {
  // isChangePassword: boolean to determine if this is a "change password" flow
  // userEmail: required when isChangePassword=true, pass the logged-in user's email

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

  // Extract token from URL when reset link is opened
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

  // Handle Forgot Password (request reset link)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      console.log("Forgot password response:", res.data);
      setSuccessMsg(
        res.data.message || "Password reset link sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to request password reset."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password using token
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccessMsg(res.data.message || "Password reset successful!");
      setStep("done");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password for logged-in users
  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        email,
        currentPassword,
        newPassword,
      });
      setSuccessMsg(res.data.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", marginTop: "3rem" }}>
      {/* Forgot Password Step */}
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
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMsg && (
            <div className="alert alert-success mt-3">{successMsg}</div>
          )}
        </>
      )}

      {/* Reset Password Step */}
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
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMsg && (
            <div className="alert alert-success mt-3">{successMsg}</div>
          )}
        </>
      )}

      {/* Change Password Step */}
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
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMsg && (
            <div className="alert alert-success mt-3">{successMsg}</div>
          )}
        </>
      )}

      {/* Done Step */}
      {step === "done" && (
        <div className="alert alert-success mt-5">
          Password reset successful! Redirecting to login page...
        </div>
      )}
    </div>
  );
}
