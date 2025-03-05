import {useState, useEffect} from 'react';
import Cookies from 'js-cookie';
import {API_ROUTES} from '@/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function usePDFViewer(revId: string | number | null) {
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (revId !== null) {
            setLoading(true);
            setError(null);
            const token = Cookies.get('token');
            fetch(`${API_URL}${API_ROUTES.rev.document(revId)}`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${token}`}
            })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    return res.blob();
                })
                .then(blob => {
                    if (blob.size === 0) throw new Error('Received empty PDF');
                    const url = URL.createObjectURL(blob);
                    setPdfFile(url);
                })
                .catch(err => setError('Failed to load PDF: ' + err.message))
                .finally(() => setLoading(false));
        } else {
            setPdfFile(null);
            setError(null);
        }
    }, [revId]);

    return {pdfFile, loading, error};
}
