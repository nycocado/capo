import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { GetPendingAssemblyCountQuery } from "@modules/assembly-list/application/queries";

@QueryHandler(GetPendingAssemblyCountQuery)
export class GetPendingAssemblyCountHandler implements IQueryHandler<GetPendingAssemblyCountQuery> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
  ) {}

  execute(): Promise<number> {
    return this.repository.countPending();
  }
}
