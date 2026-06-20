import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AssemblyListGateway } from "@modules/assembly-list/assembly-list.gateway";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events";

/**
 * Cross-stage: concluir um pipe_length pode libertar uma ordem de montagem pelo
 * gating; reemite o sinal de invalidação no socket da montagem.
 */
@EventsHandler(PipeLengthStatusChangedEvent)
export class AssemblyUpstreamProjection implements IEventHandler<PipeLengthStatusChangedEvent> {
  constructor(private readonly gateway: AssemblyListGateway) {}

  handle(): void {
    this.gateway.emitUpstream();
  }
}
