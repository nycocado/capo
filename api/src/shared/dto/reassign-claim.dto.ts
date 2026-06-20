import { IsInt, IsPositive } from "class-validator";

export class ReassignClaimDto {
  @IsInt()
  @IsPositive()
  userId!: number;
}
