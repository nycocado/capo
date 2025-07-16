import { SpoolDto } from "./spool.dto";
import { WorkStatusDto } from "./work-status.dto";

export interface WeldListDto {
  id: number;
  internalId: string;
  spool: SpoolDto;
  workStatus?: WorkStatusDto;
}
