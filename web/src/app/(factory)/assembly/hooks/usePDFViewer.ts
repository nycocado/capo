import { useState, useEffect } from 'react';
import ky from 'ky';
import { API_ROUTES } from '@/routes';

const API_ERRORS = {
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 'Session expired. Please login again.',
  INVALID_DOCUMENT: 'Invalid document ID provided.',
  EMPTY_DOCUMENT: 'Received empty PDF',
};

export function usePDFViewer(document: string | null) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setPdfFile(null);
      setError(null);
      return;
    }

    const fetchPDF = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ky.get(API_ROUTES.documents.download(document), {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === API_ERRORS.UNAUTHORIZED) {
            throw new Error(API_ERRORS.SESSION_EXPIRED);
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error(API_ERRORS.EMPTY_DOCUMENT);
        }

        const url = URL.createObjectURL(blob);
        setPdfFile(url);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unexpected error loading PDF';
        setError(errorMessage);
        setPdfFile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [document]);

  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, []);

  return { pdfFile, loading, error };
}
