import { IEvent } from "@nestjs/cqrs";
import type { WeldEntity } from "@modules/weld/entities";

/** Disparado quando uma weld muda de status (solda concluída). */
export class WeldStatusChangedEvent implements IEvent {
  constructor(
    readonly weld: WeldEntity,
    readonly userId: number,
  ) {}
}
