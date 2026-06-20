import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { GetWpsListQuery } from "@modules/wps/application/queries";

@QueryHandler(GetWpsListQuery)
export class GetWpsListHandler implements IQueryHandler<GetWpsListQuery> {
  constructor(
    @InjectRepository(WpsEntity)
    private readonly repository: EntityRepository<WpsEntity>,
  ) {}

  execute(): Promise<WpsEntity[]> {
    return this.repository.findAll();
  }
}
