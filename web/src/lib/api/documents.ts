import { API_ROUTES } from "@/routes";
import { browserApi } from "./client";

export function downloadDocument(
  section: string,
  filename: string,
): Promise<Blob> {
  return browserApi
    .get(API_ROUTES.documents.download(section, filename))
    .blob();
}
