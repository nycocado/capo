import React from "react";

export default function FactoryLayout(
    {children}: { children: React.ReactNode }
) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-black overflow-auto">
            {children}
        </div>
    );
}