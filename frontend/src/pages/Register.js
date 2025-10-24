import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import registerBg from "../assets/Register.jpg";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  userType: yup
    .string()
    .oneOf(["JOBSEEKER", "EMPLOYER"], "Select a valid role")
    .required("Role is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");
  const [timer, setTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const sendOtp = async (formData) => {
    const { email } = formData;
    try {
      setIsSending(true);
      await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      setEmailToVerify(email);
      setTimer(30);
      toast.success("OTP sent to your email. Please check.", {
        position: "top-right",
      });
    } catch (err) {
      console.log("Error sending OTP:", err);
      toast.error(
        err.response?.data?.message || "Failed to send OTP. Try again later.",
        { position: "top-right" }
      );
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtpAndRegister = async (formData) => {
    try {
      const otpValid = await api.post("/auth/verify-otp", {
        email: emailToVerify,
        otp,
      });
      if (!otpValid.data) {
        toast.error("Invalid OTP. Please try again.", {
          position: "top-right",
        });
        return;
      }

      const { confirmPassword, ...submitData } = formData;
      const res = await api.post("/auth/register", submitData);
      toast.success("Registration successful! Please login.", {
        position: "top-right",
      });
      navigate("/login");
    } catch (err) {
      console.log("Registration error:", err);
      let msg = "Registration failed";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else {
          msg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg, { position: "top-right" });
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${registerBg})`,
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
        className="card shadow-sm p-4"
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          minWidth: 320,
          maxWidth: 400,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 1)",
        }}
      >
        <h3 className="mb-4">Register</h3>
        <form
          onSubmit={
            otpSent
              ? handleSubmit(verifyOtpAndRegister)
              : handleSubmit(async (formData) => {
                  await sendOtp(formData);
                })
          }
          noValidate
        >
          {!otpSent && (
            <>
              <div className="mb-3">
                <input
                  {...register("name")}
                  className={`form-control${errors.name ? " is-invalid" : ""}`}
                  placeholder="Name"
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby="nameError"
                />
                {errors.name && (
                  <div id="nameError" className="invalid-feedback">
                    {errors.name.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <input
                  {...register("email")}
                  className={`form-control${errors.email ? " is-invalid" : ""}`}
                  placeholder="Email"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby="emailError"
                  type="email"
                />
                {errors.email && (
                  <div id="emailError" className="invalid-feedback">
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <input
                  {...register("password")}
                  className={`form-control${
                    errors.password ? " is-invalid" : ""
                  }`}
                  placeholder="Password"
                  type="password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby="passwordError"
                />
                {errors.password && (
                  <div id="passwordError" className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <input
                  {...register("confirmPassword")}
                  className={`form-control${
                    errors.confirmPassword ? " is-invalid" : ""
                  }`}
                  placeholder="Confirm Password"
                  type="password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby="confirmPasswordError"
                />
                {errors.confirmPassword && (
                  <div id="confirmPasswordError" className="invalid-feedback">
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <select
                  {...register("userType")}
                  className={`form-select${
                    errors.userType ? " is-invalid" : ""
                  }`}
                  aria-invalid={errors.userType ? "true" : "false"}
                  aria-describedby="userTypeError"
                >
                  <option value="">Select a role</option>
                  <option value="JOBSEEKER">Job Seeker</option>
                  <option value="EMPLOYER">Employer</option>
                </select>
                {errors.userType && (
                  <div id="userTypeError" className="invalid-feedback">
                    {errors.userType.message}
                  </div>
                )}
              </div>
            </>
          )}

          {otpSent && (
            <div className="mb-3">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="form-control"
                placeholder="Enter OTP"
              />
              <div className="mt-2">
                {timer > 0 ? (
                  <span>Resend OTP in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="btn btn-secondary"
                    disabled={isSending}
                  >
                    {isSending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              otpSent ? (
                "Verifying..."
              ) : (
                "Sending OTP..."
              )
            ) : otpSent ? (
              <>
                <FaUserPlus className="me-2" />
                Verify OTP & Register
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
