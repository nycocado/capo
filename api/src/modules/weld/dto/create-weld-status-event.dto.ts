import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { WeldStatus } from "@modules/weld/entities/weld.entity";

export class CreateWeldStatusEventDto {
  @IsEnum(WeldStatus)
  status!: WeldStatus;

  @IsOptional()
  @IsInt()
  fillerMaterialId?: number;

  @IsOptional()
  @IsInt()
  wpsId?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
