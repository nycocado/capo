import { API_ROUTES } from "@/routes";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import { browserApi, toSearchParams } from "./client";

export interface WeldStepParams {
  wps?: string;
  fillerMaterial?: string;
}

/**
 * Avança o status de um weld, opcionalmente informando WPS e filler material.
 *
 * @param id Id do weld.
 * @param params WPS e/ou filler material a registrar na transição.
 */
export function stepWeld(
  id: number,
  params: WeldStepParams = {},
): Promise<WeldWithContext> {
  return browserApi
    .patch(API_ROUTES.welds.step(id), { searchParams: toSearchParams({ ...params }) })
    .json<WeldWithContext>();
}

/**
 * Atualiza o WPS de um weld.
 *
 * @param id Id do weld.
 * @param wps Identificador do WPS.
 */
export function setWeldWps(id: number, wps: string): Promise<WeldWithContext> {
  return browserApi
    .patch(API_ROUTES.welds.wps(id), { searchParams: { wps } })
    .json<WeldWithContext>();
}

/**
 * Atualiza o filler material de um weld.
 *
 * @param id Id do weld.
 * @param fillerMaterial Nome do filler material.
 */
export function setWeldFillerMaterial(
  id: number,
  fillerMaterial: string,
): Promise<WeldWithContext> {
  return browserApi
    .patch(API_ROUTES.welds.fillerMaterial(id), {
      searchParams: { fillerMaterial },
    })
    .json<WeldWithContext>();
}
