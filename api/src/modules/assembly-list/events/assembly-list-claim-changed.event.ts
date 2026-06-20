import { IEvent } from "@nestjs/cqrs";

export class AssemblyListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
