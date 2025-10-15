import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#fafafa",
        borderTop: "1px solid #dee2e6",
        fontSize: "1.08rem",
        padding: "18px 0 21px 0",
        color: "#6c757d",
        width: "100vw",
        position: "relative",
        left: 0,
        bottom: 0,
        boxShadow: "0 -2px 8px rgba(52,73,94,0.04)",
        margin: 0,
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 18,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 10,
        }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.9rem",
          minHeight: 40,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.45rem",
            color: "#34495e",
            letterSpacing: "0.5px",
          }}
        >
          CareerCrafter
        </span>
      </div>

      <div
        style={{
          marginTop: "7px",
          textAlign: "center",
          fontSize: "1.03rem",
          color: "#868e96",
          userSelect: "none",
        }}
      >
        © {new Date().getFullYear()} CareerCrafter. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
