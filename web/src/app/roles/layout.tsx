import React from "react";

export default function RolesLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="bg-black overflow-auto pt-5" style={{ minHeight: '100vh' }}>
            {children}
        </div>
    );
}

