import React from "react";

export default function UnauthorizedLayout(
    {children}: { children: React.ReactNode }
) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-black overflow-auto text-primary">
            {children}
        </div>
    );
}