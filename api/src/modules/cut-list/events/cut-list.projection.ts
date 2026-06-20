import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CutListGateway } from "@modules/cut-list/cut-list.gateway";
import { CutListClaimChangedEvent } from "@modules/cut-list/events";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events";

/** Projeta a mudança de claim da cut_list no socket do estágio de corte. */
@EventsHandler(CutListClaimChangedEvent)
export class CutListClaimChangedProjection implements IEventHandler<CutListClaimChangedEvent> {
  constructor(private readonly gateway: CutListGateway) {}

  handle(event: CutListClaimChangedEvent): void {
    this.gateway.emitClaimChanged(event.listId);
  }
}

/** Projeta a mudança de status de um pipe_length no socket do estágio de corte. */
@EventsHandler(PipeLengthStatusChangedEvent)
export class CutListPipeLengthStatusProjection implements IEventHandler<PipeLengthStatusChangedEvent> {
  constructor(private readonly gateway: CutListGateway) {}

  handle(event: PipeLengthStatusChangedEvent): void {
    this.gateway.emitStatusChanged(event.pipeLength);
  }
}
