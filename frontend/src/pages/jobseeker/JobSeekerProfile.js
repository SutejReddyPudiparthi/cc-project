import React, { useEffect, useState, useContext } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  getJobSeekerById,
  getJobSeekerByUserId,
  createJobSeeker,
  updateJobSeeker,
  verifyUserCredentials,
  deleteUser,
} from "../../api/api";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import yourBackgroundImage from "../../assets/JobSeeker.jpg";
import Password from "../Password";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const educationSchema = yup.object({
  level: yup.string().required("Level is required"),
  institutionName: yup.string().required("Institution name is required"),
  stream: yup.string(),
  startYear: yup
    .number()
    .typeError("Start Year must be a number")
    .required("Start year is required"),
  endYear: yup
    .number()
    .typeError("End Year must be a number")
    .required("End year is required"),
  location: yup.string().required("Location is required"),
});

const certificateSchema = yup.object({
  certificateName: yup.string().required("Certificate name is required"),
  organization: yup.string().required("Organization is required"),
  startDate: yup.string(),
  endDate: yup.string(),
});

const projectSchema = yup.object({
  projectName: yup.string().required("Project name is required"),
  description: yup.string().required("Description is required"),
  link: yup.string().url("Project link must be a valid URL").nullable(true),
});

const socialLinkSchema = yup.object({
  platform: yup.string().required("Platform is required"),
  url: yup.string().url("Enter a valid URL").required("URL is required"),
});

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required").min(2).max(70),
  email: yup
    .string()
    .required("Email is required")
    .email("Email should be valid"),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"], "Select a valid gender")
    .required("Gender is required"),
  dateOfBirth: yup
    .date()
    .max(new Date(), "Date of Birth cannot be in the future")
    .nullable(true)
    .typeError("Invalid date")
    .required("Date of Birth is required"),
  phone: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Invalid phone number")
    .required("Valid Phone number is required"),
  address: yup.string().max(150).required("Address is required"),
  skills: yup.string().max(100).required("Skills are required"),
  experience: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Please enter a valid experience (number of years)")
    .required("Experience is required")
    .min(0)
    .max(50),
  aboutMe: yup.string().max(1000, "About Me can't exceed 1000 characters"),
  educationDetails: yup
    .array()
    .of(educationSchema)
    .min(1, "At least one education entry required"),
  certificates: yup.array().of(certificateSchema),
  projects: yup.array().of(projectSchema),
  socialLinks: yup.array().of(socialLinkSchema),
});

export default function JobSeekerProfile({ onProfileUpdated }) {
  const { user, setUser } = useContext(AuthContext);
  const userId = user?.userId;
  const storedId = user?.jobSeekerId;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      phone: "",
      address: "",
      skills: "",
      experience: "",
      aboutMe: "",
      educationDetails: [
        {
          level: "",
          institutionName: "",
          stream: "",
          startYear: "",
          endYear: "",
          location: "",
        },
      ],
      certificates: [
        {
          certificateName: "",
          organization: "",
          startDate: "",
          endDate: "",
        },
      ],
      projects: [{ projectName: "", description: "", link: "" }],
      socialLinks: [{ platform: "", url: "" }],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "educationDetails" });
  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({ control, name: "certificates" });
  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control, name: "projects" });
  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({ control, name: "socialLinks" });

  // Handle sidebar-driven mode and modals
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

  // Load JobSeeker profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!userId) return;
        const res = storedId
          ? await getJobSeekerById(storedId)
          : await getJobSeekerByUserId(userId);
        if (res?.data) {
          setExistingProfile(res.data);
          Object.keys(res.data).forEach((key) => {
            let val = res.data[key];
            if (key === "dateOfBirth" && val) val = val.split("T")[0];
            if (
              Array.isArray(val) &&
              [
                "educationDetails",
                "certificates",
                "projects",
                "socialLinks",
              ].includes(key)
            ) {
              setValue(key, val.length ? val : [getValues(key)?.[0] || {}]);
            } else {
              setValue(key, val);
            }
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId, storedId, setValue, getValues]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      const jobSeekerId = existingProfile?.jobSeekerId;
      if (!jobSeekerId) return;
      try {
        const res = await axios.get(
          `http://localhost:8081/api/applications/jobseeker/${jobSeekerId}`
        );
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      }
    };
    fetchApplications();
  }, [existingProfile]);

  // Form submit
  async function onSubmit(data) {
    try {
      if (data.dateOfBirth) {
        if (typeof data.dateOfBirth === "string") {
          data.dateOfBirth = data.dateOfBirth.split("T")[0];
        } else if (data.dateOfBirth instanceof Date) {
          const year = data.dateOfBirth.getFullYear();
          const month = String(data.dateOfBirth.getMonth() + 1).padStart(
            2,
            "0"
          );
          const day = String(data.dateOfBirth.getDate()).padStart(2, "0");
          data.dateOfBirth = `${year}-${month}-${day}`;
        }
      }

      let res;
      if (existingProfile?.jobSeekerId) {
        data.jobSeekerId = existingProfile.jobSeekerId;
        res = await updateJobSeeker(data);
        toast.success("Job Seeker profile updated successfully");
      } else {
        data.userId = parseInt(userId, 10);
        res = await createJobSeeker(data);
        toast.success("Job Seeker profile created successfully");
      }

      setExistingProfile(res.data);
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(res.data);

      localStorage.setItem("jobSeekerId", res.data.jobSeekerId);
      setUser((prevUser) => ({
        ...prevUser,
        jobSeekerId: res.data.jobSeekerId,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || "Error saving profile");
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

  // View mode
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
          style={{ minHeight: "80vh", maxWidth: 650 }}
        >
          <div className="card shadow p-4" style={{ width: "100%" }}>
            <h3 className="mb-4">Job Seeker Profile</h3>
            <p>
              <strong>Full Name:</strong> {existingProfile?.fullName || "-"}
            </p>
            <p>
              <strong>Email:</strong> {existingProfile?.email || "-"}
            </p>
            <p>
              <strong>Gender:</strong> {existingProfile?.gender || "-"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {existingProfile?.dateOfBirth || "-"}
            </p>
            <p>
              <strong>Phone:</strong> {existingProfile?.phone || "-"}
            </p>
            <p>
              <strong>Address:</strong> {existingProfile?.address || "-"}
            </p>
            <p>
              <strong>About Me:</strong> {existingProfile?.aboutMe || "-"}
            </p>
            <p>
              <strong>Skills:</strong> {existingProfile?.skills || "-"}
            </p>
            <p>
              <strong>Experience:</strong> {existingProfile?.experience ?? "-"}
            </p>

            <div>
              <strong>Education:</strong>
              {(existingProfile?.educationDetails || []).length > 0 ? (
                <ul style={{ marginBottom: 0 }}>
                  {existingProfile.educationDetails.map((edu, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{edu.level}</span>
                        {" @ "}
                        <span>{edu.institutionName}</span>
                        {edu.stream && <> (Stream: {edu.stream})</>}
                      </div>
                      <div>
                        {edu.startYear} - {edu.endYear}, {edu.location}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span> - </span>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Certificates:</strong>
              {(existingProfile?.certificates || []).length > 0 ? (
                <ul style={{ marginBottom: 0 }}>
                  {existingProfile.certificates.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>
                          {cert.certificateName}
                        </span>
                        {" ("}
                        {cert.organization}
                        {")"}
                      </div>
                      <div>
                        {cert.startDate ? cert.startDate : "?"} -{" "}
                        {cert.endDate ? cert.endDate : "?"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span> - </span>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <strong>Projects:</strong>
              {(existingProfile?.projects || []).length > 0 ? (
                <ul style={{ marginBottom: 0 }}>
                  {existingProfile.projects.map((proj, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>
                          {proj.projectName}
                        </span>
                        {": "}
                        {proj.description}
                        {proj.link && (
                          <>
                            {" "}
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              [link]
                            </a>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span> - </span>
              )}
            </div>

            <div>
              <strong>Social Links:</strong>
              <ul>
                {(existingProfile?.socialLinks || []).map((link, idx) => (
                  <li key={idx}>
                    {link.platform}:{" "}
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/*
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
            */}
            
          </div>
        </div>
      </div>
    );

  // Edit/Create mode
  return (
    <div className="container d-flex justify-content-center align-items-center my-5">
      <div className="card shadow p-4" style={{ maxWidth: 600, width: "100%" }}>
        <h3 className="mb-4">
          {existingProfile ? "Edit Profile" : "Create Profile"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Main profile fields */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input className="form-control" {...register("fullName")} />
            <small className="text-danger">{errors.fullName?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              {...register("email")}
            />
            <small className="text-danger">{errors.email?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Gender</label>
            <select className="form-control" {...register("gender")}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <small className="text-danger">{errors.gender?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              {...register("dateOfBirth")}
            />
            <small className="text-danger">{errors.dateOfBirth?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" {...register("phone")} />
            <small className="text-danger">{errors.phone?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <input className="form-control" {...register("address")} />
            <small className="text-danger">{errors.address?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Skills</label>
            <input className="form-control" {...register("skills")} />
            <small className="text-danger">{errors.skills?.message}</small>
          </div>
          <div className="mb-3">
            <label className="form-label">Experience (Years)</label>
            <input
              type="number"
              className="form-control"
              {...register("experience")}
            />
            <small className="text-danger">{errors.experience?.message}</small>
          </div>
          {/* About Me */}
          <div className="mb-3">
            <label htmlFor="aboutMe" className="form-label">
              About Me
            </label>
            <textarea
              id="aboutMe"
              className="form-control"
              rows={3}
              {...register("aboutMe")}
            />
            <small className="text-danger">{errors.aboutMe?.message}</small>
          </div>
          {/* Education Section */}
          <div className="mb-3">
            <label className="form-label">Education</label>
            {educationFields.map((field, idx) => (
              <div className="border rounded p-2 mb-2" key={field.id}>
                <input
                  className="form-control mb-1"
                  placeholder="Level"
                  {...register(`educationDetails.${idx}.level`)}
                />
                <small className="text-danger">
                  {errors.educationDetails?.[idx]?.level?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Institution Name"
                  {...register(`educationDetails.${idx}.institutionName`)}
                />
                <small className="text-danger">
                  {errors.educationDetails?.[idx]?.institutionName?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Stream"
                  {...register(`educationDetails.${idx}.stream`)}
                />
                <input
                  className="form-control mb-1"
                  placeholder="Start Year"
                  type="number"
                  {...register(`educationDetails.${idx}.startYear`)}
                />
                <small className="text-danger">
                  {errors.educationDetails?.[idx]?.startYear?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="End Year"
                  type="number"
                  {...register(`educationDetails.${idx}.endYear`)}
                />
                <small className="text-danger">
                  {errors.educationDetails?.[idx]?.endYear?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Location"
                  {...register(`educationDetails.${idx}.location`)}
                />
                <small className="text-danger">
                  {errors.educationDetails?.[idx]?.location?.message}
                </small>
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => removeEducation(idx)}
                  disabled={educationFields.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                appendEducation({
                  level: "",
                  institutionName: "",
                  stream: "",
                  startYear: "",
                  endYear: "",
                  location: "",
                })
              }
            >
              Add Education
            </button>
            <small className="text-danger">
              {typeof errors.educationDetails === "string"
                ? errors.educationDetails
                : ""}
            </small>
          </div>
          {/* Certificates Section */}
          <div className="mb-3">
            <label className="form-label">Certificates</label>
            {certificateFields.map((field, idx) => (
              <div className="border rounded p-2 mb-2" key={field.id}>
                <input
                  className="form-control mb-1"
                  placeholder="Certificate Name"
                  {...register(`certificates.${idx}.certificateName`)}
                />
                <small className="text-danger">
                  {errors.certificates?.[idx]?.certificateName?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Organization"
                  {...register(`certificates.${idx}.organization`)}
                />
                <small className="text-danger">
                  {errors.certificates?.[idx]?.organization?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Start Date YYYY-MM"
                  type="month"
                  {...register(`certificates.${idx}.startDate`)}
                />
                <input
                  className="form-control mb-1"
                  placeholder="End Date YYYY-MM"
                  type="month"
                  {...register(`certificates.${idx}.endDate`)}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => removeCertificate(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                appendCertificate({
                  certificateName: "",
                  organization: "",
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Add Certificate
            </button>
          </div>
          {/* Projects Section */}
          <div className="mb-3">
            <label className="form-label">Projects</label>
            {projectFields.map((field, idx) => (
              <div className="border rounded p-2 mb-2" key={field.id}>
                <input
                  className="form-control mb-1"
                  placeholder="Project Name"
                  {...register(`projects.${idx}.projectName`)}
                />
                <small className="text-danger">
                  {errors.projects?.[idx]?.projectName?.message}
                </small>
                <textarea
                  className="form-control mb-1"
                  placeholder="Description"
                  {...register(`projects.${idx}.description`)}
                />
                <small className="text-danger">
                  {errors.projects?.[idx]?.description?.message}
                </small>
                <input
                  className="form-control mb-1"
                  placeholder="Link"
                  type="url"
                  {...register(`projects.${idx}.link`)}
                />
                <small className="text-danger">
                  {errors.projects?.[idx]?.link?.message}
                </small>
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => removeProject(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                appendProject({ projectName: "", description: "", link: "" })
              }
            >
              Add Project
            </button>
          </div>
          {/* Social Links Section */}
          <div className="mb-3">
            <label className="form-label">Social Links</label>
            {socialFields.map((field, idx) => (
              <div className="border rounded p-2 mb-2" key={field.id}>
                <input
                  className="form-control mb-1"
                  placeholder="Platform (e.g., LinkedIn)"
                  {...register(`socialLinks.${idx}.platform`)}
                />
                <small className="text-danger">
                  {errors.socialLinks?.[idx]?.platform?.message}
                </small>
                <input
                  className="form-control mb-1"
                  type="url"
                  placeholder="URL"
                  {...register(`socialLinks.${idx}.url`)}
                />
                <small className="text-danger">
                  {errors.socialLinks?.[idx]?.url?.message}
                </small>
                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => removeSocial(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => appendSocial({ platform: "", url: "" })}
            >
              Add Social Link
            </button>
          </div>
          {/* Submit & Cancel */}
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
