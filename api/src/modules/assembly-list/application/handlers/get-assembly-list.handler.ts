import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { GetAssemblyListQuery } from "@modules/assembly-list/application/queries";

@QueryHandler(GetAssemblyListQuery)
export class GetAssemblyListHandler implements IQueryHandler<GetAssemblyListQuery> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
  ) {}

  execute({ data }: GetAssemblyListQuery): Promise<AssemblyListEntity> {
    return this.repository.loadDetail(data.id);
  }
}
