import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { CutListEntity } from "@modules/cut-list/entities";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { GetCutListQuery } from "@modules/cut-list/application/queries";

@QueryHandler(GetCutListQuery)
export class GetCutListHandler implements IQueryHandler<GetCutListQuery> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
  ) {}

  execute({ data }: GetCutListQuery): Promise<CutListEntity> {
    return this.repository.loadDetail(data.id);
  }
}
