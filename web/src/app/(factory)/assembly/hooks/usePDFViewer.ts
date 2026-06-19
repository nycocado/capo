import { useState, useEffect } from "react";
import { downloadDocument } from "@/lib/api";

const EMPTY_DOCUMENT = "Received empty PDF";

/**
 * Carrega um documento PDF a partir do nome de ficheiro e devolve uma object
 * URL temporária para o iframe/embed.
 *
 * @param document Nome do ficheiro no storage (ou `null` para limpar o viewer).
 * @param section Secção/pasta do storage (por omissão `isometric`).
 * @returns Estado de carregamento, erro e a object URL do PDF.
 */
export function usePDFViewer(
  document: string | null,
  section: string = "isometric",
) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A object URL é local ao efeito: a cleanup revoga exatamente a que criou.
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
