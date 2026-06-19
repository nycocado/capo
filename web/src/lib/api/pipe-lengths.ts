import { API_ROUTES } from "@/routes";
import { PipeLengthDto, PipeLengthStatus, StatusEventDto } from "@/dtos";
import { browserApi } from "./client";

export interface CreatePipeLengthStatusEvent {
  status: PipeLengthStatus;
  heatNumber?: string;
  notes?: string;
}

/**
 * Regista um evento de status para um pipe-length (avança a máquina de estados).
 *
 * @param id Id do pipe-length.
 * @param body Status alvo e dados da transição (heatNumber/notes).
 * @returns O pipe-length atualizado.
 */
export function createPipeLengthStatusEvent(
  id: number,
  body: CreatePipeLengthStatusEvent,
): Promise<PipeLengthDto> {
  return browserApi
    .post(API_ROUTES.pipeLengths.statusEvents(id), { json: body })
    .json<PipeLengthDto>();
}

/** Histórico de eventos de status de um pipe-length (QC). */
export function getPipeLengthStatusEvents(
  id: number,
): Promise<StatusEventDto[]> {
  return browserApi
    .get(API_ROUTES.pipeLengths.statusEvents(id))
    .json<StatusEventDto[]>();
}
