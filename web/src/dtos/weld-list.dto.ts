import { SpoolDto } from "./spool.dto";
import { UserDto } from "./user.dto";
import { ListProgress } from "./status.dto";

export interface WeldListDto {
  id: number;
  internalId: string;
  spool: SpoolDto;
  claimedBy: UserDto | null;
  claimedAt: string | null;
  progress?: ListProgress;
  available?: boolean;
  /** Nº total de welds (apenas na resposta da lista leve). */
  weldCount?: number;
}
