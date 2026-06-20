import { useState, useEffect } from "react";
import { downloadDocument } from "@/lib/api";

const EMPTY_DOCUMENT = "Received empty PDF";

export function usePDFViewer(
  document: string | null,
  section: string = "isometric",
) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadPDF = async () => {
      if (!document) {
        setPdfFile(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const blob = await downloadDocument(section, document);
        if (blob.size === 0) {
          throw new Error(EMPTY_DOCUMENT);
        }
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPdfFile(objectUrl);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unexpected error loading PDF",
        );
        setPdfFile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPDF();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document, section]);

  return { pdfFile, loading, error };
}
