import { MaterialDto } from "./material.dto";
import { FittingTypeDto } from "./fitting-type.dto";
import { PortDto } from "./port.dto";

export interface FittingDto {
  part: number;
  internalId: string;
  description: string;
  length: number;
  thickness: number;
  heatNumber: string | null;
  material: MaterialDto;
  fittingType: FittingTypeDto;
  ports?: PortDto[];
}
