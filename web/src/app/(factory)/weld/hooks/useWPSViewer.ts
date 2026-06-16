import { useState, useEffect } from "react";
import { downloadDocument } from "@/lib/api";

const EMPTY_DOCUMENT = "Received empty WPS PDF";

export function useWPSViewer(document: string | null) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A object URL é local ao efeito: a cleanup revoga exatamente a que criou,
    // evitando o leak da versão anterior (que lia o state pdfUrl em closure).
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadWPSPDF = async () => {
      if (!document) {
        setPdfUrl(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const blob = await downloadDocument(document);
        if (blob.size === 0) {
          throw new Error(EMPTY_DOCUMENT);
        }

        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPdfUrl(objectUrl);
      } catch (err) {
        if (cancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load WPS PDF";
        setError(errorMessage);
        setPdfUrl(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadWPSPDF();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document]);

  return {
    pdfUrl,
    isLoading,
    error,
  };
}
