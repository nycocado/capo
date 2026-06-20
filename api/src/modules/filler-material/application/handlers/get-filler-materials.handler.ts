import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { FillerMaterialEntity } from "@modules/filler-material/entities/filler-material.entity";
import { GetFillerMaterialsQuery } from "@modules/filler-material/application/queries";

@QueryHandler(GetFillerMaterialsQuery)
export class GetFillerMaterialsHandler implements IQueryHandler<GetFillerMaterialsQuery> {
  constructor(
    @InjectRepository(FillerMaterialEntity)
    private readonly repository: EntityRepository<FillerMaterialEntity>,
  ) {}

  execute(): Promise<FillerMaterialEntity[]> {
    return this.repository.findAll();
  }
}
