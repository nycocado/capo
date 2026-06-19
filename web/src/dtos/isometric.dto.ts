import { SpoolDto } from "./spool.dto";

export interface IsometricDto {
  id: number;
  internalId: string;
  document: string;
  spools?: SpoolDto[];
}
