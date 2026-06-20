import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PipeLengthStatus } from "@modules/pipe-length/entities/pipe-length.entity";

export class CreatePipeLengthStatusEventDto {
  @IsEnum(PipeLengthStatus)
  status!: PipeLengthStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  heatNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
