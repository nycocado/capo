import { IEvent } from "@nestjs/cqrs";
import type { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";

export class PipeLengthStatusChangedEvent implements IEvent {
  constructor(
    readonly pipeLength: PipeLengthEntity,
    readonly userId: number,
  ) {}
}
