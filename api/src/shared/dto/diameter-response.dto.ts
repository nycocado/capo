import { Expose } from "class-transformer";

export class DiameterResponseDto {
  @Expose()
  nominalMm: number;

  @Expose()
  nominalInch: number;
}
