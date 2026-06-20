import { API_ROUTES } from "@/routes";
import { JointDto, JointStatus, StatusEventDto } from "@/dtos";
import { browserApi } from "./client";

export interface CreateJointStatusEvent {
  status: JointStatus;
  notes?: string;
}

export function createJointStatusEvent(
  id: number,
  body: CreateJointStatusEvent,
): Promise<JointDto> {
  return browserApi
    .post(API_ROUTES.joints.statusEvents(id), { json: body })
    .json<JointDto>();
}

export function getJointStatusEvents(id: number): Promise<StatusEventDto[]> {
  return browserApi
    .get(API_ROUTES.joints.statusEvents(id))
    .json<StatusEventDto[]>();
}
