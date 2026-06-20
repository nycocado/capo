import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CutListGateway } from "@modules/cut-list/cut-list.gateway";
import { CutListClaimChangedEvent } from "@modules/cut-list/events/cut-list-claim-changed.event";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events/pipe-length-status-changed.event";

@EventsHandler(CutListClaimChangedEvent)
export class CutListClaimChangedProjection implements IEventHandler<CutListClaimChangedEvent> {
  constructor(private readonly gateway: CutListGateway) {}

  handle(event: CutListClaimChangedEvent): void {
    this.gateway.emitClaimChanged(event.listId);
  }
}

@EventsHandler(PipeLengthStatusChangedEvent)
export class CutListPipeLengthStatusProjection implements IEventHandler<PipeLengthStatusChangedEvent> {
  constructor(private readonly gateway: CutListGateway) {}

  handle(event: PipeLengthStatusChangedEvent): void {
    this.gateway.emitStatusChanged(event.pipeLength);
  }
}
