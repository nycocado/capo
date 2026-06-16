import { useState, useEffect } from "react";
import { downloadDocument } from "@/lib/api";

const EMPTY_DOCUMENT = "Received empty PDF";

/**
 * Carrega um documento PDF a partir do nome de arquivo da API e devolve
 * uma object URL temporária para uso no iframe/embed.
 *
 * @param document Nome do arquivo no storage (ou `null` para limpar o viewer).
 * @returns Estado de carregamento, erro e a object URL do PDF.
 */
export function usePDFViewer(document: string | null) {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // A object URL é local ao efeito: a cleanup revoga exatamente a que criou,
    // evitando o leak da versão anterior (que lia o state pdfFile em closure).
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
        const blob = await downloadDocument(document);

        if (blob.size === 0) {
          throw new Error(EMPTY_DOCUMENT);
        }

        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPdfFile(objectUrl);
      } catch (err) {
        if (cancelled) return;
        const errorMessage =
          err instanceof Error ? err.message : "Unexpected error loading PDF";
        setError(errorMessage);
        setPdfFile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPDF();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document]);

  return { pdfFile, loading, error };
}
