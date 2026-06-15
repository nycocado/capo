import React from "react";

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-auto"
      style={{
        minHeight: "100vh",
        paddingTop: "var(--navbar-height)",
        background: "var(--app-bg)",
      }}
    >
      {children}
    </div>
  );
}
