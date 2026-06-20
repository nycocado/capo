import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { GetWeldListsQuery } from "@modules/weld-list/application/queries";

@QueryHandler(GetWeldListsQuery)
export class GetWeldListsHandler implements IQueryHandler<GetWeldListsQuery> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
  ) {}

  execute(): Promise<WeldListEntity[]> {
    return this.repository.loadAllLight();
  }
}
