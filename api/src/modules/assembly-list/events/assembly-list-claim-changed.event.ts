import { IEvent } from "@nestjs/cqrs";

/** Disparado quando o lock (claim) de uma assembly_list muda. */
export class AssemblyListClaimChangedEvent implements IEvent {
  constructor(
    readonly listId: number,
    readonly userId: number | null,
  ) {}
}
