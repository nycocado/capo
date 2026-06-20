import { IEvent } from "@nestjs/cqrs";

/** Disparado quando o lock (claim) de uma cut_list muda. */
export class CutListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
