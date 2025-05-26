import React from "react";

export default function ManagementLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="d-flex bg-black">
            {children}
        </div>
    );
}