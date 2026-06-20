import { IEvent } from "@nestjs/cqrs";
import type { JointEntity } from "@modules/joint/entities";

/** Disparado quando um joint muda de status (montagem concluída). */
export class JointStatusChangedEvent implements IEvent {
  constructor(
    readonly joint: JointEntity,
    readonly userId: number,
  ) {}
}
