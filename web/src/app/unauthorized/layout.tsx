import React from "react";

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 overflow-auto"
      style={{ background: "var(--app-bg)" }}
    >
      {children}
    </div>
  );
}
