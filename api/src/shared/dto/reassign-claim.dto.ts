import { IsInt, IsPositive } from "class-validator";

/**
 * Corpo de `PUT /<x>-lists/:id/claim` — reatribuição de claim por um
 * administrador para outro utilizador.
 */
export class ReassignClaimDto {
  @IsInt()
  @IsPositive()
  userId!: number;
}
