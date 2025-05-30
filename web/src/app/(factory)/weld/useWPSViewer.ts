import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_ROUTES } from '@/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useWPSViewer(
  wpsId: string | number | null
): { wpsFile: string | null; loading: boolean; error: string | null } {
  const [wpsFile, setWpsFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wpsId !== null) {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      fetch(`${API_URL}${API_ROUTES.wps.document(wpsId)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.blob();
        })
        .then(blob => {
          if (blob.size === 0) throw new Error('Received empty PDF');
          const url = URL.createObjectURL(blob);
          setWpsFile(url);
        })
        .catch(err => setError('Failed to load WPS PDF: ' + err.message))
        .finally(() => setLoading(false));
    } else {
      setWpsFile(null);
      setError(null);
    }
  }, [wpsId]);

  return { wpsFile, loading, error };
}

