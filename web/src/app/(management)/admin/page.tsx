// app/dashboard/page.tsx
import {cookies} from 'next/headers';
import DashboardClient from './DashboardClient';
import {StatisticsData} from '@models/statistics/statistics-data.interface';
import {API_ROUTES} from "@/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <div className="p-4 text-danger">Token de autenticação não encontrado.</div>;
    }

    try {
        const res = await fetch(`${API_URL}${API_ROUTES.statistic.overall(1)}`, {
            method: 'GET',
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
