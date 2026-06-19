import { PipeLengthDto } from "./pipe-length.dto";
import { FittingDto } from "./fitting.dto";

export type PartType = "pipe_length" | "fitting";

export interface PartDto {
  id: number;
  type: PartType;
  number: string;
  pipeLength?: PipeLengthDto;
  fitting?: FittingDto;
}
