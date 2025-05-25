"use client";

import Card from 'react-bootstrap/Card';
import {Alert} from 'react-bootstrap';
import {useRouter} from 'next/navigation';
import {Role} from "@/app/roles/page";

interface RolesListProps {
    roles: Role[];
    error?: string;
}

export default function RolesList({roles, error}: RolesListProps) {
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
            {roles.map((role) => (
                <div key={role.id} className="flex-shrink-0 me-4">
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
        </>
    );
}
