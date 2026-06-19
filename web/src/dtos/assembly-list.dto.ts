import { IsometricDto } from "./isometric.dto";
import { UserDto } from "./user.dto";
import { ListProgress } from "./status.dto";

export interface AssemblyListDto {
  id: number;
  internalId: string;
  isometric: IsometricDto;
  claimedBy: UserDto | null;
  claimedAt: string | null;
  progress?: ListProgress;
  available?: boolean;
  /** Nº de spools (apenas na resposta da lista leve). */
  spoolCount?: number;
  /** Nº total de welds (apenas na resposta da lista leve). */
  weldCount?: number;
}
