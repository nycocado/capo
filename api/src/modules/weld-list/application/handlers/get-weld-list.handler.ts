import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { GetWeldListQuery } from "@modules/weld-list/application/queries";

@QueryHandler(GetWeldListQuery)
export class GetWeldListHandler implements IQueryHandler<GetWeldListQuery> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
  ) {}

  execute({ data }: GetWeldListQuery): Promise<WeldListEntity> {
    return this.repository.loadDetail(data.id);
  }
}
