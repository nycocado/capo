import { PipeLengthStatus } from "./status.dto";

/** Linha da trilha de auditoria de um item (pipe-length/joint/weld). */
export interface StatusEventDto {
  id: number;
  status: PipeLengthStatus;
  notes: string | null;
  createdBy: number | null;
  createdAt: string;
}
