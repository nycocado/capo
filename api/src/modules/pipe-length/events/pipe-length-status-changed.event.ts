import { IEvent } from "@nestjs/cqrs";
import type { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";

/** Disparado quando um pipe_length muda de status (corte iniciado/concluído). */
export class PipeLengthStatusChangedEvent implements IEvent {
  constructor(
    readonly pipeLength: PipeLengthEntity,
    readonly userId: number,
  ) {}
}
