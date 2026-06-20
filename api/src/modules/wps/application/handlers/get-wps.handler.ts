import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { WpsEntity } from "@modules/wps/entities";
import { GetWpsQuery } from "@modules/wps/application/queries";

@QueryHandler(GetWpsQuery)
export class GetWpsHandler implements IQueryHandler<GetWpsQuery> {
  constructor(
    @InjectRepository(WpsEntity)
    private readonly repository: EntityRepository<WpsEntity>,
  ) {}

  execute({ data }: GetWpsQuery): Promise<WpsEntity> {
    return this.repository.findOneOrFail({ id: data.id });
  }
}
