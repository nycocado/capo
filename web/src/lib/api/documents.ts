import { API_ROUTES } from "@/routes";
import { browserApi } from "./client";

/**
 * Baixa um documento (PDF de isometric/WPS) como Blob.
 *
 * @param section Secção/pasta (`isometric` ou `wps`).
 * @param filename Nome do ficheiro.
 */
export function downloadDocument(
  section: string,
  filename: string,
): Promise<Blob> {
  return browserApi
    .get(API_ROUTES.documents.download(section, filename))
    .blob();
}
