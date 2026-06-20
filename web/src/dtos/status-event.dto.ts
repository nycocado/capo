import { PipeLengthStatus } from "./status.dto";

export interface StatusEventDto {
  id: number;
  status: PipeLengthStatus;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
}
