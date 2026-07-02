import { FillerMaterialDto } from "./shared-primitives.dto";
import { WpsDto } from "./wps.dto";
import { WeldStatus } from "./status.dto";

export interface WeldDto {
  id: number;
  number: string;
  fillerMaterial?: FillerMaterialDto | null;
  wps?: WpsDto | null;
  status: WeldStatus;
}
