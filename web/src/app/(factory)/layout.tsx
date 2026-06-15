import React from "react";

export default function FactoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-black overflow-auto"
      style={{ minHeight: "100vh", paddingTop: "var(--navbar-height)" }}
    >
      {children}
    </div>
  );
}
