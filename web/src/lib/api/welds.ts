import { API_ROUTES } from "@/routes";
import { WeldDto, WeldStatus, StatusEventDto } from "@/dtos";
import { browserApi } from "./client";

export interface CreateWeldStatusEvent {
  status: WeldStatus;
  fillerMaterialId?: number;
  wpsId?: number;
  notes?: string;
}

/**
 * Regista um evento de status para um weld (avança a máquina de estados; o
 * backend exige fillerMaterial + wps na transição para `done`).
 *
 * @param id Id do weld.
 * @param body Status alvo e dados da transição (fillerMaterialId/wpsId/notes).
 * @returns O weld atualizado.
 */
export function createWeldStatusEvent(
  id: number,
  body: CreateWeldStatusEvent,
): Promise<WeldDto> {
  return browserApi
    .post(API_ROUTES.welds.statusEvents(id), { json: body })
    .json<WeldDto>();
}

/** Histórico de eventos de status de um weld (QC). */
export function getWeldStatusEvents(id: number): Promise<StatusEventDto[]> {
  return browserApi
    .get(API_ROUTES.welds.statusEvents(id))
    .json<StatusEventDto[]>();
}
