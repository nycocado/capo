import { MaterialDto } from "./material.dto";
import { DiameterDto } from "./diameter.dto";
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
