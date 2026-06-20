import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { CutListEntity } from "@modules/cut-list/entities/cut-list.entity";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { GetCutListsQuery } from "@modules/cut-list/application/queries";

@QueryHandler(GetCutListsQuery)
export class GetCutListsHandler implements IQueryHandler<GetCutListsQuery> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
  ) {}

  execute(): Promise<CutListEntity[]> {
    return this.repository.loadAllLight();
  }
}
