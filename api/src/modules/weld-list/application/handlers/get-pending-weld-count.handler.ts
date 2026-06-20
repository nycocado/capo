import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { GetPendingWeldCountQuery } from "@modules/weld-list/application/queries";

@QueryHandler(GetPendingWeldCountQuery)
export class GetPendingWeldCountHandler implements IQueryHandler<GetPendingWeldCountQuery> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
  ) {}

  execute(): Promise<number> {
    return this.repository.countPending();
  }
}
