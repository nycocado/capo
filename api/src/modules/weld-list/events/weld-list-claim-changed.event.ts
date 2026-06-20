import { IEvent } from "@nestjs/cqrs";

/** Disparado quando o lock (claim) de uma weld_list muda. */
export class WeldListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
