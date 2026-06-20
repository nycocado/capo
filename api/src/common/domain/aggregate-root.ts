import { IEvent } from "@nestjs/cqrs";

/**
 * Base de um agregado: acumula domain events que o use-case despacha no
 * EventBus **após o commit** (`pullDomainEvents`). A coleção é volátil (não é
 * mapeada pelo MikroORM nem serializada) e é inicializada de forma preguiçosa,
 * pois entidades hidratadas da BD não passam pelo construtor.
 */
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
