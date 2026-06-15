import { API_ROUTES } from "@/routes";
import { browserApi } from "./client";

/**
 * Baixa um documento (PDF de rev/WPS) como Blob.
 *
 * @param path Caminho do documento (`section/filename`).
 */
export function downloadDocument(path: string): Promise<Blob> {
  return browserApi.get(API_ROUTES.documents.download(path)).blob();
}
