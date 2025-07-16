import { DiameterResponseDto } from "@shared/dto";
import { Expose, Type } from "class-transformer";

export class PortResponseDto {
  @Expose()
  number: number;

  @Expose()
  @Type(() => DiameterResponseDto)
  diameter: DiameterResponseDto;
}
