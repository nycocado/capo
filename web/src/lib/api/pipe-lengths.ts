import { API_ROUTES } from "@/routes";
import { PipeLengthDto, PipeLengthStatus, StatusEventDto } from "@/dtos";
import { browserApi } from "./client";

export interface CreatePipeLengthStatusEvent {
  status: PipeLengthStatus;
  heatNumber?: string;
  notes?: string;
}

export function createPipeLengthStatusEvent(
  id: number,
  body: CreatePipeLengthStatusEvent,
): Promise<PipeLengthDto> {
  return browserApi
    .post(API_ROUTES.pipeLengths.statusEvents(id), { json: body })
    .json<PipeLengthDto>();
}

export function getPipeLengthStatusEvents(
  id: number,
): Promise<StatusEventDto[]> {
  return browserApi
    .get(API_ROUTES.pipeLengths.statusEvents(id))
    .json<StatusEventDto[]>();
}
