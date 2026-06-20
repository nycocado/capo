import { IEvent } from "@nestjs/cqrs";

export class CutListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
