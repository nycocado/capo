import { useState, useEffect } from "react";
import ky from "ky";
import { API_ROUTES } from "@/routes";

const API_ERRORS = {
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: "Session expired. Please login again.",
  INVALID_DOCUMENT: "Invalid WPS ID provided.",
  EMPTY_DOCUMENT: "Received empty WPS PDF",
};

export function useWPSViewer(document: string | null) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      setPdfUrl(null);
      setError(null);
      return;
    }

    const fetchWPSPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await ky.get(API_ROUTES.documents.download(document), {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === API_ERRORS.UNAUTHORIZED) {
            throw new Error(API_ERRORS.SESSION_EXPIRED);
          }
          throw new Error(`Failed to fetch WPS PDF: ${response.status}`);
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error(API_ERRORS.EMPTY_DOCUMENT);
        }

        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load WPS PDF";
        setError(errorMessage);
        setPdfUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWPSPDF();

    // Cleanup function to revoke object URL
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document]);

  return {
    pdfUrl,
    isLoading,
    error,
  };
}
