import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { GetAssemblyListsQuery } from "@modules/assembly-list/application/queries";

@QueryHandler(GetAssemblyListsQuery)
export class GetAssemblyListsHandler implements IQueryHandler<GetAssemblyListsQuery> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
  ) {}

  execute(): Promise<AssemblyListEntity[]> {
    return this.repository.loadAllLight();
  }
}
