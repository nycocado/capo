import {cookies} from 'next/headers';
import RolesClient from "@/app/roles/RolesClient";
import {API_ROUTES, ROUTES} from "@/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface Role {
    id: string;
    title: string;
    route?: string;
}

const fixedRoles: Role[] = [
    {id: 'cutting-operator', title: 'Cutting Operator', route: ROUTES.cut},
    {id: 'pipe-fitter', title: 'Pipe Fitter', route: ROUTES.assembly},
    {id: 'welder', title: 'Welder', route: ROUTES.weld},
    {id: 'admin', title: 'Administrator', route: ROUTES.admin},
];

export default async function RolesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

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

        return <RolesClient roles={mappedRoles}/>;
    } catch {
        return <RolesClient roles={[]} error="Failed to load roles. Please try again."/>;
    }
}

