import { Injectable } from '@nestjs/common';
import { ProjectEntity } from '@modules/project/entities';
import { ProjectRepository } from '@modules/project/project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async getById(id: number): Promise<ProjectEntity> {
    return this.projectRepository.findByIdOrFail(id);
  }

  async getAll(): Promise<ProjectEntity[]> {
    return this.projectRepository.findAll();
  }
}
