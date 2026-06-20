import { PipeLengthDto } from "@/dtos";

export interface PipeLengthWithContext extends PipeLengthDto {
  id: number;
  isometricInfo?: {
    internalId: string;
  };
}
