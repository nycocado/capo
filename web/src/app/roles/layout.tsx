import React from "react";
import {Container} from "react-bootstrap";

export default function RolesLayout(
    {children}: { children: React.ReactNode }
) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-black overflow-auto">
            <Container fluid className="bg-surface p-5 d-flex flex-column align-items-center">
                <div className="overflow-auto w-100">
                    <div className="d-flex flex-column justify-content-center" style={{minWidth: 'max-content'}}>
                        <h1 className="display-6 fw-semibold text-center mb-5">Roles</h1>
                        <div className="d-flex justify-content-center">
                            {children}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}