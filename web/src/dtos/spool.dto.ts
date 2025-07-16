import { JointDto } from "./joint.dto";
import { WeldDto } from "./weld.dto";

export interface SpoolDto {
  id: number;
  internalId: string;
  joints?: JointDto[];
  welds?: WeldDto[];
}
