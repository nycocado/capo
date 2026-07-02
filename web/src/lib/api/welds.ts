import { API_ROUTES } from "@/routes";
import { WeldDto, WeldStatus } from "@dtos";
import { browserApi } from "./client";

export interface CreateWeldStatusEvent {
  status: WeldStatus;
  fillerMaterialId?: number;
  wpsId?: number;
  notes?: string;
}

export function createWeldStatusEvent(
  id: number,
  body: CreateWeldStatusEvent,
): Promise<WeldDto> {
  return browserApi
    .post(API_ROUTES.welds.statusEvents(id), { json: body })
    .json<WeldDto>();
}
