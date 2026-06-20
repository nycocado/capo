import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PipeLengthStatus } from "@modules/pipe-length/entities/pipe-length.entity";

export class CreatePipeLengthStatusEventDto {
  @IsEnum(PipeLengthStatus)
  status!: PipeLengthStatus;

  // Obrigatório na transição para in_progress (validado no service)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  heatNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
