import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { WeldEntity } from "@modules/weld/entities";
import { WeldRepository } from "@modules/weld/weld.repository";
import { GetWeldQuery } from "@modules/weld/application/queries";

@QueryHandler(GetWeldQuery)
export class GetWeldHandler implements IQueryHandler<GetWeldQuery> {
  constructor(
    @InjectRepository(WeldEntity)
    private readonly welds: WeldRepository,
  ) {}

  execute({ data }: GetWeldQuery): Promise<WeldEntity> {
    return this.welds.loadDetail(data.id);
  }
}
