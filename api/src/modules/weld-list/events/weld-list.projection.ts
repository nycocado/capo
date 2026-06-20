import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WeldListGateway } from "@modules/weld-list/weld-list.gateway";
import { WeldListClaimChangedEvent } from "@modules/weld-list/events/weld-list-claim-changed.event";
import { WeldStatusChangedEvent } from "@modules/weld/events/weld-status-changed.event";
import { JointStatusChangedEvent } from "@modules/joint/events/joint-status-changed.event";

@EventsHandler(WeldListClaimChangedEvent)
export class WeldListClaimChangedProjection implements IEventHandler<WeldListClaimChangedEvent> {
  constructor(private readonly gateway: WeldListGateway) {}

  handle(event: WeldListClaimChangedEvent): void {
    this.gateway.emitClaimChanged(event.listId);
  }
}

@EventsHandler(JointStatusChangedEvent)
export class WeldListUpstreamProjection implements IEventHandler<JointStatusChangedEvent> {
  constructor(private readonly gateway: WeldListGateway) {}

  handle(): void {
    this.gateway.emitUpstream();
  }
}

@EventsHandler(WeldStatusChangedEvent)
export class WeldListWeldStatusProjection implements IEventHandler<WeldStatusChangedEvent> {
  constructor(private readonly gateway: WeldListGateway) {}

  handle(event: WeldStatusChangedEvent): void {
    this.gateway.emitStatusChanged(event.weld);
  }
}
