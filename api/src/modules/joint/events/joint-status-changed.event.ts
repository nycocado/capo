import { IEvent } from "@nestjs/cqrs";
import type { JointEntity } from "@modules/joint/entities/joint.entity";

export class JointStatusChangedEvent implements IEvent {
  constructor(
    readonly joint: JointEntity,
    readonly userId: number,
  ) {}
}
