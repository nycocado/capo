import { JointStatus } from "@modules/joint/entities";

export interface CreateJointStatusEventInput {
  id: number;
  status: JointStatus;
  notes?: string;
  userId: number;
}

export class CreateJointStatusEventCommand {
  constructor(readonly data: CreateJointStatusEventInput) {}
}
