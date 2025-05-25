import {cookies} from 'next/headers';
import RolesList from "@/app/roles/RolesList";
import {API_ROUTES} from "@/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface Role {
    id: string;
    title: string;
    route?: string;
}

const fixedRoles: Role[] = [
    {id: 'cutting-operator', title: 'Cutting Operator', route: '/cut'},
    {id: 'pipe-fitter', title: 'Pipe Fitter', route: '/assembly'},
    {id: 'welder', title: 'Welder', route: '/weld'},
    {id: 'admin', title: 'Administrator', route: '/admin'},
];

export default async function RolesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <RolesList roles={[]} error="Not authenticated"/>;
    }

    try {
        const res = await fetch(`${API_URL}${API_ROUTES.user.roles}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) throw new Error();

        const backend: Role[] = await res.json();

        const mappedRoles = fixedRoles.filter(role => backend.some(backendRole => backendRole.id === role.id));

        return <RolesList roles={mappedRoles}/>;
    } catch {
        return <RolesList roles={[]} error="Failed to load roles. Please try again."/>;
    }
}

