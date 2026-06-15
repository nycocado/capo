import { useState, useEffect } from "react";
import { downloadDocument } from "@/lib/api";

const EMPTY_DOCUMENT = "Received empty PDF";

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
        const blob = await downloadDocument(document);

        if (blob.size === 0) {
          throw new Error(EMPTY_DOCUMENT);
        }

        const url = URL.createObjectURL(blob);
        setPdfFile(url);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unexpected error loading PDF";
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
