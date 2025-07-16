import { PipeLengthDto } from "@/dtos";

export interface PipeLengthWithContext extends PipeLengthDto {
  isometricInfo?: {
    internalId: string;
    sheetNumber: number;
  };
}
