import { Expose, Type } from "class-transformer";
import { SheetResponseDto } from "@shared/dto/sheet-response.dto";

export class IsometricResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
  @Type(() => SheetResponseDto)
  sheets?: SheetResponseDto[];
}
