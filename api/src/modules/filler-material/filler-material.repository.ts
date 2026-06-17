import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { EntityRepository } from "@mikro-orm/mariadb";

@Injectable()
export class FillerMaterialRepository {
  constructor(
    @InjectRepository(FillerMaterialEntity)
    private readonly fillerMaterialRepository: EntityRepository<FillerMaterialEntity>,
  ) {}

  async findByIdOrFail(id: number): Promise<FillerMaterialEntity> {
    return this.fillerMaterialRepository.findOneOrFail(id);
  }

  async findAll(): Promise<FillerMaterialEntity[]> {
    return this.fillerMaterialRepository.findAll();
  }
}
