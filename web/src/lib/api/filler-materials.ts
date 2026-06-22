import { API_ROUTES } from "@/routes";
import { FillerMaterialDto } from "@dtos";
import { browserApi } from "./client";

export function getAllFillerMaterials(): Promise<FillerMaterialDto[]> {
  return browserApi
    .get(API_ROUTES.fillerMaterials.base)
    .json<FillerMaterialDto[]>();
}
