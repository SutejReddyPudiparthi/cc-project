import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { verifyUserCredentials, deleteUser } from "../api/api";
import { toast } from "react-toastify";

export default function DeleteAccountPage() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = user?.userId;

  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      const verifyRes = await verifyUserCredentials({
        email: deleteEmail,
        password: deletePassword,
      });
      if (!verifyRes.data) {
        setDeleteError("Email or password incorrect.");
        setDeleting(false);
        return;
      }
      await deleteUser(userId);
      toast.success("Account deleted successfully.");
      setUser(null);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      setDeleteError(err.response?.data || "Unexpected error");
      toast.error(err.response?.data || "Failed to delete account");
      setDeleting(false);
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: 500,
          width: "100%",
          borderRadius: "12px",
          position: "relative",
        }}
      >
        <button
          type="button"
          className="btn-close"
          style={{ position: "absolute", top: 15, right: 15 }}
          onClick={() => navigate(-1)}
          aria-label="Close"
        ></button>
        <h5 className="mb-3">Delete Account</h5>
        <p>Enter your credentials to confirm:</p>
        <form onSubmit={handleDeleteAccount}>
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            value={deleteEmail}
            onChange={(e) => setDeleteEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="Password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            required
          />
          {deleteError && <small className="text-danger">{deleteError}</small>}
          <div className="d-flex justify-content-end mt-3">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
