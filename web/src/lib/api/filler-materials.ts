import { API_ROUTES } from "@/routes";
import { FillerMaterialDto } from "@/dtos";
import { browserApi } from "./client";

/**
 * Lista os filler materials disponíveis (uso no browser, para os selects do weld).
 */
export function getAllFillerMaterials(): Promise<FillerMaterialDto[]> {
  return browserApi
    .get(API_ROUTES.fillerMaterials.base)
    .json<FillerMaterialDto[]>();
}
