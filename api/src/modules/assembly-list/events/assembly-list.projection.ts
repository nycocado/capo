import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AssemblyListGateway } from "@modules/assembly-list/assembly-list.gateway";
import { AssemblyListClaimChangedEvent } from "@modules/assembly-list/events";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events";
import { JointStatusChangedEvent } from "@modules/joint/events";

/** Projeta a mudança de claim da assembly_list no socket do estágio de montagem. */
@EventsHandler(AssemblyListClaimChangedEvent)
export class AssemblyListClaimChangedProjection implements IEventHandler<AssemblyListClaimChangedEvent> {
  constructor(private readonly gateway: AssemblyListGateway) {}

  handle(event: AssemblyListClaimChangedEvent): void {
    this.gateway.emitClaimChanged(event.listId);
  }
}

/**
 * Cross-stage: concluir um pipe_length pode libertar uma ordem de montagem pelo
 * gating; reemite o sinal de invalidação no socket da montagem.
 */
@EventsHandler(PipeLengthStatusChangedEvent)
export class AssemblyListUpstreamProjection implements IEventHandler<PipeLengthStatusChangedEvent> {
  constructor(private readonly gateway: AssemblyListGateway) {}

  handle(): void {
    this.gateway.emitUpstream();
  }
}

/** Projeta a mudança de status de um joint no socket do estágio de montagem. */
@EventsHandler(JointStatusChangedEvent)
export class AssemblyListJointStatusProjection implements IEventHandler<JointStatusChangedEvent> {
  constructor(private readonly gateway: AssemblyListGateway) {}

  handle(event: JointStatusChangedEvent): void {
    this.gateway.emitStatusChanged(event.joint);
  }
}
