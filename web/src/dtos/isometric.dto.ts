import { SheetDto } from "./sheet.dto";

export interface IsometricDto {
  id: number;
  internalId: string;
  sheets?: SheetDto[];
}
