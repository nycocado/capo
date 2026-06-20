import { WeldStatus } from "@modules/weld/entities/weld.entity";

export interface CreateWeldStatusEventInput {
  id: number;
  status: WeldStatus;
  fillerMaterialId?: number;
  wpsId?: number;
  notes?: string;
  userId: number;
}

export class CreateWeldStatusEventCommand {
  constructor(readonly data: CreateWeldStatusEventInput) {}
}
