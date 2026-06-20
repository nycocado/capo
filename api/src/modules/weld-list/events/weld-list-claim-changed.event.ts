import { IEvent } from "@nestjs/cqrs";

export class WeldListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
