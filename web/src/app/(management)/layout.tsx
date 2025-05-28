import React from "react";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-secondary">
            {children}
        </div>
    );
}