import { IsometricDto } from "./isometric.dto";
import { WorkStatusDto } from "./work-status.dto";

export interface AssemblyListDto {
  id: number;
  internalId: string;
  isometric: IsometricDto;
  workStatus?: WorkStatusDto;
}
