import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FittingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.fitting.findMany({
      include: {
        material: true,
        part: true,
        fittingType: true,
        ports: true,
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
      },
    });
  }

  async findAllByProject(projectId: number) {
    return this.databaseService.fitting.findMany({
      where: {
        isometric: {
          projectId: projectId,
        },
      },
      include: {
        material: true,
        part: true,
        fittingType: true,
        ports: true,
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
      },
    });
  }

  async findOne(id: number) {
    return this.databaseService.fitting.findUnique({
      where: { id },
      include: {
        material: true,
        part: true,
        fittingType: true,
        ports: true,
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
      },
    });
  }
}
