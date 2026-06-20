import { IEvent } from "@nestjs/cqrs";
import type { WeldEntity } from "@modules/weld/entities/weld.entity";

export class WeldStatusChangedEvent implements IEvent {
  constructor(
    readonly weld: WeldEntity,
    readonly userId: number,
  ) {}
}
