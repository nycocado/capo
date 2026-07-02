import { DiameterDto } from "./shared-primitives.dto";

export interface PortDto {
  number: number;
  diameter: DiameterDto;
}
