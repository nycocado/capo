"use client";

import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { ROUTES } from "@/routes";

function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="text-center px-4" style={{ color: "var(--text)" }}>
      <p
        className="mb-2"
        style={{
          color: "var(--accent)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
        }}
      >
        Access denied
      </p>
      <h1 className="display-3 fw-semibold mb-3">401</h1>
      <p className="fs-5 mb-4" style={{ color: "var(--steel)" }}>
        You don&apos;t have permission to access this station.
      </p>
      <Button
        variant="primary"
        className="fw-semibold px-4"
        onClick={() => router.push(ROUTES.roles)}
      >
        Back to stations
      </Button>
    </div>
  );
}

export default UnauthorizedPage;
