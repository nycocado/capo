import { PartDto } from "./part.dto";
import { WeldDto } from "./weld.dto";
import { JointStatus } from "./status.dto";

export interface JointDto {
  id: number;
  part1: PartDto;
  part2: PartDto;
  welds?: WeldDto[];
  status: JointStatus;
}
