import { JointStatus } from "@modules/joint/entities/joint.entity";

export interface CreateJointStatusEventInput {
  id: number;
  status: JointStatus;
  notes?: string;
  userId: number;
}

export class CreateJointStatusEventCommand {
  constructor(readonly data: CreateJointStatusEventInput) {}
}
