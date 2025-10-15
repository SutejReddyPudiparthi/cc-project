import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  getEmployerById,
  getEmployerByUserId,
  createEmployer,
  updateEmployer,
  verifyUserCredentials,
  deleteUser,
} from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import yourBackgroundImage from "../../assets/Employer.jpg";
import Password from "../Password";

export default function EmployerProfile({ onProfileUpdated }) {
  const { user, refreshUser, setUser } = useContext(AuthContext);
  const userId = user?.userId;
  const storedId = user?.employerId;

  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const schema = yup.object().shape({
    fullName: yup.string().required("Full Name is required").max(100),
    companyName: yup.string().required("Company Name is required").max(150),
    workEmail: yup
      .string()
      .required("Work Email is required")
      .email("Invalid email format")
      .max(150),
    companyDescription: yup
      .string()
      .required("Company Description is required")
      .max(1000),
    position: yup.string().required("Position is required").max(100),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!userId) return;
        const res = storedId
          ? await getEmployerById(storedId)
          : await getEmployerByUserId(userId);
        if (res?.data) {
          setExistingProfile(res.data);
          Object.keys(res.data).forEach((key) => {
            let val = res.data[key];
            if (typeof val === "object" && val !== null) {
              val = JSON.stringify(val);
            }
            setValue(key, val);
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId, storedId, setValue]);

  async function onSubmit(data) {
    try {
      let res;
      if (existingProfile?.employerId) {
        data.employerId = existingProfile.employerId;
        res = await updateEmployer(data);
        alert("Employer profile updated successfully");
      } else {
        data.userId = parseInt(userId);
        res = await createEmployer(data);
        alert("Employer profile created successfully");

        const employer = res.data;
        localStorage.setItem("employerId", employer.employerId);
        setUser((prev) => ({
          ...prev,
          employerId: employer.employerId,
        }));
      }
      setExistingProfile(res.data);
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(res.data);
    } catch (err) {
      alert(err.response?.data || "Error saving profile");
    }
  }

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
      alert("Account deleted successfully.");
      setUser(null);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      setDeleteError(err.response?.data || "Unexpected error");
      setDeleting(false);
    }
  }

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border" role="status" aria-hidden="true"></div>
        <span className="visually-hidden">Loading...</span>
      </div>
    );

  if (!isEditing)
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          backgroundImage: `url(${yourBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          className="container d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <div
            className="card shadow p-4"
            style={{ maxWidth: 600, width: "100%" }}
          >
            <h3 className="mb-4">Employer Profile</h3>
            <p>
              <strong>Full Name:</strong> {existingProfile?.fullName || "-"}
            </p>
            <p>
              <strong>Company Name:</strong>{" "}
              {existingProfile?.companyName || "-"}
            </p>
            <p>
              <strong>Work Email:</strong> {existingProfile?.workEmail || "-"}
            </p>
            <p>
              <strong>Company Description:</strong>{" "}
              {existingProfile?.companyDescription || "-"}
            </p>
            <p>
              <strong>Position:</strong> {existingProfile?.position || "-"}
            </p>
            <div className="mt-4">
              <button
                className="btn btn-primary me-2"
                onClick={() => setIsEditing(true)}
              >
                {existingProfile ? "Edit Profile" : "Create Profile"}
              </button>
              <button
                className="btn btn-warning me-2"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1050,
                }}
                onMouseDown={(e) => {
                  // Only allow close when clicking the overlay itself (not modal)
                  if (e.target === e.currentTarget)
                    setShowChangePassword(false);
                }}
              >
                <div
                  className="card shadow-lg p-4"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "12px",
                    position: "relative",
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Prevents overlay click through
                >
                  <button
                    type="button"
                    className="btn-close"
                    style={{ position: "absolute", top: 15, right: 15 }}
                    onClick={() => setShowChangePassword(false)}
                  ></button>
                  <Password isChangePassword={true} userEmail={user?.email} />
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1050,
                }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) setShowDeleteModal(false);
                }}
              >
                <div
                  className="card p-3"
                  style={{
                    maxWidth: "500px",
                    width: "100%",
                    borderRadius: "12px",
                    position: "relative",
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    type="button"
                    className="btn-close"
                    style={{ position: "absolute", top: 15, right: 15 }}
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                  <div className="modal-content p-3">
                    <h5>Confirm Account Deletion</h5>
                    <p>
                      This action is irreversible. Please confirm your email and
                      password.
                    </p>
                    <form onSubmit={handleDeleteAccount}>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={deleteEmail}
                        onChange={(e) => setDeleteEmail(e.target.value)}
                        required
                        autoFocus
                      />
                      <input
                        type="password"
                        className="form-control mt-2"
                        placeholder="Password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        required
                      />
                      {deleteError && (
                        <div className="text-danger mt-2 mb-2">
                          {deleteError}
                        </div>
                      )}
                      <button
                        type="submit"
                        className="btn btn-danger me-2"
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={deleting}
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="container d-flex justify-content-center align-items-center my-5">
      <div className="card shadow p-4" style={{ maxWidth: 600, width: "100%" }}>
        <h3 className="mb-4">
          {existingProfile ? "Edit Profile" : "Create Profile"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              id="fullName"
              className="form-control"
              {...register("fullName")}
            />
            <small className="text-danger">{errors.fullName?.message}</small>
          </div>
          <div className="mb-3">
            <label htmlFor="companyName" className="form-label">
              Company Name
            </label>
            <input
              id="companyName"
              className="form-control"
              {...register("companyName")}
            />
            <small className="text-danger">{errors.companyName?.message}</small>
          </div>
          <div className="mb-3">
            <label htmlFor="workEmail" className="form-label">
              Work Email
            </label>
            <input
              id="workEmail"
              type="email"
              className="form-control"
              {...register("workEmail")}
            />
            <small className="text-danger">{errors.workEmail?.message}</small>
          </div>
          <div className="mb-3">
            <label htmlFor="companyDescription" className="form-label">
              Company Description
            </label>
            <textarea
              id="companyDescription"
              className="form-control"
              {...register("companyDescription")}
            />
            <small className="text-danger">
              {errors.companyDescription?.message}
            </small>
          </div>
          <div className="mb-3">
            <label htmlFor="position" className="form-label">
              Position
            </label>
            <input
              id="position"
              className="form-control"
              {...register("position")}
            />
            <small className="text-danger">{errors.position?.message}</small>
          </div>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
