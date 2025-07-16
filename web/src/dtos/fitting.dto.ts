import { MaterialDto } from "./material.dto";
import { FittingTypeDto } from "./fitting-type.dto";
import { PortDto } from "./port.dto";
import { WorkStatusDto } from "./work-status.dto";

export interface FittingDto {
  id: number;
  number: string;
  internalId: string;
  description: string;
  length: number;
  thickness: number;
  heatNumber: string | null;
  material: MaterialDto;
  fittingType: FittingTypeDto;
  ports?: PortDto[];
  workStatus?: WorkStatusDto;
}
