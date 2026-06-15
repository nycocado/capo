import { API_ROUTES } from "@/routes";
import { JointDto } from "@/dtos";
import { browserApi } from "./client";

/**
 * Avança o status de um joint (assembly).
 *
 * @param id Id do joint.
 */
export function stepJoint(id: number): Promise<JointDto> {
  return browserApi.patch(API_ROUTES.joints.step(id)).json<JointDto>();
}
