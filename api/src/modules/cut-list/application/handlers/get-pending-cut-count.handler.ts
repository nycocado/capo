import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { CutListEntity } from "@modules/cut-list/entities";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { GetPendingCutCountQuery } from "@modules/cut-list/application/queries";

@QueryHandler(GetPendingCutCountQuery)
export class GetPendingCutCountHandler implements IQueryHandler<GetPendingCutCountQuery> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
  ) {}

  execute(): Promise<number> {
    return this.repository.countPending();
  }
}
