import AssemblyClient from "@/app/(factory)/assembly/AssemblyClient";
import {cookies} from "next/headers";
import {API_ROUTES} from "@/routes";
import {Joint} from "@models/joint.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default async function AssemblyPage() {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token')?.value;
    let items: Joint[] = [];
    let fetchError: string | undefined;
    try {
        const res = await fetch(`${API_URL}${API_ROUTES.joint.assembly}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            throw new Error('Failed to load joints.');
        }
        items = await res.json();
    } catch (err) {
        fetchError = err instanceof Error ? err.message : 'Unexpected error while fetching data.';
    }

    return (<AssemblyClient initialItems={items} fetchError={fetchError}/>);
}