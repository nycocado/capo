import WeldClient from "./WeldClient";
import {cookies} from "next/headers";
import {API_ROUTES} from "@/routes";
import {Weld} from "@models/weld.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default async function WeldPage() {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token')?.value;
    let items: Weld[] = [];
    let fetchError: string | undefined;

    try {
        const res = await fetch(`${API_URL}${API_ROUTES.weld.welding}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            throw new Error('Failed to load welds.');
        }
        items = await res.json();
    } catch (err) {
        fetchError = err instanceof Error ? err.message : 'Unexpected error while fetching data.';
    }

    return <WeldClient initialItems={items} fetchError={fetchError}/>;
}