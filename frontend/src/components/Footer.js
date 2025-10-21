import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    function handleScrollOrResize() {
      const scrollable =
        document.documentElement.scrollHeight > window.innerHeight;
      if (!scrollable) {
        setShow(true); // Always show if the page isn't scrollable
      } else {
        // Only show when scrolled near bottom (adjust 50 for tolerance)
        setShow(
          window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 50
        );
      }
    }
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    handleScrollOrResize();

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  if (!show) return null;

  return (
    <footer
      style={{
        backgroundColor: "#fafafa",
        borderTop: "1px solid #dee2e6",
        fontSize: "1.08rem",
        padding: "18px 0 21px 0",
        color: "#6c757d",
        width: "100vw",
        position: "fixed",
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
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#216ab4ff",
            letterSpacing: "0.9px",
          }}
        >
          CareerCrafter
        </span>
      </div>

      <div
        style={{
          marginTop: "1px",
          textAlign: "center",
          fontSize: "1.1rem",
          color: "#090909ff",
          userSelect: "none",
        }}
      >
        © {new Date().getFullYear()} CareerCrafter. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
