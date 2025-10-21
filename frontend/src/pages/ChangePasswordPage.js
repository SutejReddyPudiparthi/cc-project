import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import Password from "./Password";

export default function ChangePasswordPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
        <Password isChangePassword={true} userEmail={user?.email} />
      </div>
    </div>
  );
}
