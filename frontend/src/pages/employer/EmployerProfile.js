import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  getEmployerById,
  getEmployerByUserId,
  createEmployer,
  updateEmployer,
} from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import yourBackgroundImage from "../../assets/Employer.jpg";
import Password from "../Password";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EmployerProfile({ onProfileUpdated }) {
  const { user, setUser } = useContext(AuthContext);
  const userId = user?.userId;
  const storedId = user?.employerId;

  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
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
    if (!location.state) return;
    if (location.state.mode === "edit") {
      setIsEditing(true);
    } else if (location.state.mode === "create") {
      setIsEditing(true);
    } else if (location.state.mode === "view") {
      setIsEditing(false);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state]);

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
        toast.success("Employer profile updated successfully");
      } else {
        data.userId = parseInt(userId);
        res = await createEmployer(data);
        toast.success("Employer profile created successfully");

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
      toast.error(err.response?.data || "Error saving profile");
    }
  }

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border" role="status" aria-hidden="true"></div>
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (isEditing)
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
        <ToastContainer position="top-right" autoClose={3000} />
        <div
          className="container d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <div
            className="card shadow p-4"
            style={{ maxWidth: 600, width: "100%" }}
          >
            <h3 className="mb-4">
              {existingProfile ? "Edit Profile" : "Create Profile"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input className="form-control" {...register("fullName")} />
                <small className="text-danger">
                  {errors.fullName?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <input className="form-control" {...register("companyName")} />
                <small className="text-danger">
                  {errors.companyName?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Work Email</label>
                <input
                  type="email"
                  className="form-control"
                  {...register("workEmail")}
                />
                <small className="text-danger">
                  {errors.workEmail?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Company Description</label>
                <textarea
                  className="form-control"
                  {...register("companyDescription")}
                />
                <small className="text-danger">
                  {errors.companyDescription?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Position</label>
                <input className="form-control" {...register("position")} />
                <small className="text-danger">
                  {errors.position?.message}
                </small>
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
        <ToastContainer position="top-right" autoClose={3000} />
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
          </div>
        </div>
      </div>
    );
  return null;
}
