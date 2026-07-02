import { MaterialDto, DiameterDto } from "./shared-primitives.dto";
import { PipeLengthStatus } from "./status.dto";

export interface PipeLengthDto {
  part: number;
  internalId: string;
  description: string;
  length: number;
  thickness: number;
  heatNumber: string | null;
  material: MaterialDto;
  diameter: DiameterDto;
  status: PipeLengthStatus;
}
