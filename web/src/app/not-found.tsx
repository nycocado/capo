"use client";

import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

function NotFound() {
  const router = useRouter();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center vh-100 overflow-auto px-4"
      style={{ background: "var(--app-bg)", color: "var(--text)" }}
    >
      <p
        className="mb-2"
        style={{
          color: "var(--accent)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
        }}
      >
        Not found
      </p>
      <h1 className="display-3 fw-semibold mb-3">404</h1>
      <p className="fs-5 mb-4" style={{ color: "var(--steel)" }}>
        This page isn&apos;t part of the line.
      </p>
      <Button
        variant="primary"
        className="fw-semibold px-4"
        onClick={() => router.push(ROUTES.home)}
      >
        Back to stations
      </Button>
    </div>
  );
}

export default NotFound;
