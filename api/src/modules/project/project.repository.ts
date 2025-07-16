import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ProjectEntity } from "@modules/project/entities";
import { EntityRepository } from "@mikro-orm/mariadb";

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: EntityRepository<ProjectEntity>,
  ) {}

  async findById(id: number): Promise<ProjectEntity | null> {
    return this.projectRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<ProjectEntity> {
    return this.projectRepository.findOneOrFail(id);
  }

  async findAll(): Promise<ProjectEntity[]> {
    return this.projectRepository.findAll();
  }
}
