import { JointDto } from "./joint.dto";

export interface SpoolDto {
  id: number;
  internalId: string;
  joints?: JointDto[];
}
