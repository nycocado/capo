import { PipeLengthDto } from "./pipe-length.dto";
import { FittingDto } from "./fitting.dto";
import { WeldDto } from "./weld.dto";
import { WorkStatusDto } from "./work-status.dto";

export interface JointDto {
  id: number;
  part1: PipeLengthDto | FittingDto;
  part2: PipeLengthDto | FittingDto;
  welds?: WeldDto[];
  workStatus?: WorkStatusDto;
}
