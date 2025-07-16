import { MaterialDto } from "./material.dto";
import { DiameterDto } from "./diameter.dto";
import { WorkStatusDto } from "./work-status.dto";

export interface PipeLengthDto {
  id: number;
  number: string;
  internalId: string;
  description: string;
  length: number;
  thickness: number;
  heatNumber: string | null;
  material: MaterialDto;
  diameter: DiameterDto;
  workStatus?: WorkStatusDto;
}
