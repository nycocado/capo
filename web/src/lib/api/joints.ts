import { API_ROUTES } from "@/routes";
import { JointDto, JointStatus, StatusEventDto } from "@/dtos";
import { browserApi } from "./client";

export interface CreateJointStatusEvent {
  status: JointStatus;
  notes?: string;
}

/**
 * Regista um evento de status para um joint (avança a máquina de estados).
 *
 * @param id Id do joint.
 * @param body Status alvo e notas opcionais.
 * @returns O joint atualizado.
 */
export function createJointStatusEvent(
  id: number,
  body: CreateJointStatusEvent,
): Promise<JointDto> {
  return browserApi
    .post(API_ROUTES.joints.statusEvents(id), { json: body })
    .json<JointDto>();
}

/** Histórico de eventos de status de um joint (QC). */
export function getJointStatusEvents(id: number): Promise<StatusEventDto[]> {
  return browserApi
    .get(API_ROUTES.joints.statusEvents(id))
    .json<StatusEventDto[]>();
}
