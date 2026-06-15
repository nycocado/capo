import { API_ROUTES } from "@/routes";
import { WpsDto } from "@/dtos";
import { browserApi } from "./client";

/**
 * Lista os WPS disponíveis (uso no browser, para os selects do weld).
 */
export function getAllWps(): Promise<WpsDto[]> {
  return browserApi.get(API_ROUTES.wps.base).json<WpsDto[]>();
}
