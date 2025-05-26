// app/dashboard/page.tsx
import {cookies} from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <div className="p-4 text-danger">Token de autenticação não encontrado.</div>;
    }

    try {
        const res = await fetch('http://localhost:3002/statistic/overall/1', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error(`Erro ao buscar estatísticas: ${res.status}`);
        }

        const data: StatisticsData = await res.json();

        return <DashboardClient data={data}/>;
    } catch (err: any) {
        return (
            <div className="p-4 text-danger">
                Erro ao carregar dados estatísticos: {err.message || 'Erro desconhecido.'}
            </div>
        );
    }
}
