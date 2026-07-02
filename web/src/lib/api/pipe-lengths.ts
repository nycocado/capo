import { API_ROUTES } from "@/routes";
import { PipeLengthDto, PipeLengthStatus } from "@dtos";
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
