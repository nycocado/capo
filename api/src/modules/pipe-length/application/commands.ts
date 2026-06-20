import { PipeLengthStatus } from "@modules/pipe-length/entities/pipe-length.entity";

export interface CreatePipeLengthStatusEventInput {
  id: number;
  status: PipeLengthStatus;
  heatNumber?: string;
  notes?: string;
  userId: number;
}

export class CreatePipeLengthStatusEventCommand {
  constructor(readonly data: CreatePipeLengthStatusEventInput) {}
}
