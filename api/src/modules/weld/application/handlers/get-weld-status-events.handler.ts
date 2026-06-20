import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { WeldEntity, WeldStatusEventEntity } from "@modules/weld/entities";
import { WeldRepository } from "@modules/weld/weld.repository";
import { GetWeldStatusEventsQuery } from "@modules/weld/application/queries";

@QueryHandler(GetWeldStatusEventsQuery)
export class GetWeldStatusEventsHandler implements IQueryHandler<GetWeldStatusEventsQuery> {
  constructor(
    @InjectRepository(WeldEntity)
    private readonly welds: WeldRepository,
  ) {}

  async execute({
    data,
  }: GetWeldStatusEventsQuery): Promise<WeldStatusEventEntity[]> {
    await this.welds.findByIdOrFail(data.id);
    return this.welds.findStatusEvents(data.id);
  }
}
