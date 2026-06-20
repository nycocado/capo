import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { GetFillerMaterialQuery } from "@modules/filler-material/application/queries";

@QueryHandler(GetFillerMaterialQuery)
export class GetFillerMaterialHandler implements IQueryHandler<GetFillerMaterialQuery> {
  constructor(
    @InjectRepository(FillerMaterialEntity)
    private readonly repository: EntityRepository<FillerMaterialEntity>,
  ) {}

  execute({ data }: GetFillerMaterialQuery): Promise<FillerMaterialEntity> {
    return this.repository.findOneOrFail({ id: data.id });
  }
}
