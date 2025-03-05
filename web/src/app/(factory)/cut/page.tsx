import CutClient from './CutClient';
import {cookies} from 'next/headers';
import {API_ROUTES} from '@/routes';
import {PipeLength} from '@models/pipe-length.interface';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default async function CutPage() {
    const cookiesStore = await cookies();
    const token = cookiesStore.get('token')?.value;
    let items: PipeLength[] = [];
    let fetchError: string | undefined;
    try {
        const res = await fetch(`${API_URL}${API_ROUTES.pipeLength.cut}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            throw new Error('Failed to load pipe lengths.');
        }
        items = await res.json();
    } catch (err) {
        fetchError = err instanceof Error ? err.message : 'Unexpected error while fetching data.';
    }
    const initialSelectedItem = items.length > 0 ? items[0] : null;
    return <CutClient initialItems={items} initialSelectedItem={initialSelectedItem} fetchError={fetchError}/>;
}

