"use client";

import Card from 'react-bootstrap/Card';
import {Alert, Container} from 'react-bootstrap';
import {useRouter} from 'next/navigation';
import {Role} from "@/app/roles/page";
import React from "react";
import NavBar from "@components/layout/NavBar/NavBar";

interface RolesListProps {
    roles: Role[];
    error?: string;
}

export default function RolesClient({roles, error}: RolesListProps) {
    const router = useRouter();

    if (error) {
        return (
            <Alert variant="danger">{error}</Alert>
        );
    }

    if (roles.length === 0) {
        return (
            <div>No roles available.</div>
        );
    }

    return (
        <>
            <NavBar title="Roles" fixed={true}/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="bg-surface p-5 d-flex flex-column align-items-center">
                    <div className="overflow-auto w-100">
                        <div className="d-flex flex-column justify-content-center" style={{minWidth: 'max-content'}}>
                            <h1 className="display-6 fw-semibold text-center mb-5">Roles</h1>
                            <div className="d-flex justify-content-center">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex-shrink-0 m-2">
                                        <Card
                                            className="text-center h-100"
                                            style={{minWidth: '200px', minHeight: '350px', cursor: 'pointer'}}
                                            onClick={() => router.push(role.route!)}
                                        >
                                            <Card.Body className="bg-tertiary"/>
                                            <Card.Footer
                                                className="bg-secondary d-flex align-items-center justify-content-center"
                                                style={{height: '4rem'}}
                                            >
                                                <h5 className="text-white mb-0">{role.title}</h5>
                                            </Card.Footer>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
}
