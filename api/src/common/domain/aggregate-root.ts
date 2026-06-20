import { IEvent } from "@nestjs/cqrs";

export abstract class AggregateRoot {
  private pendingEvents?: IEvent[];

  protected raise(event: IEvent): void {
    (this.pendingEvents ??= []).push(event);
  }

  pullDomainEvents(): IEvent[] {
    const events = this.pendingEvents ?? [];
    this.pendingEvents = [];
    return events;
  }
}
