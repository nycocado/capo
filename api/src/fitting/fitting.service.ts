import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PipeFitterService } from '../pipe-fitter/pipe-fitter.service';

@Injectable()
export class FittingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pipeFitterService: PipeFitterService,
  ) {}

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

  async findAllByIsometric(isometricId: number, userId: number) {
    await this.pipeFitterService.validatePipeFitter(userId);

    return this.databaseService.fitting.findMany({
      where: {
        isometricId: isometricId,
      },
      include: {
        material: true,
        part: true,
        fittingType: true,
        ports: {
          include: {
            diameter: true,
          },
          omit: {
            diameterId: true,
            fittingId: true,
          },
        },
        isometric: {
          include: {
            sheet: {
              omit: { isometricId: true },
            },
          },
          omit: { projectId: true },
        },
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
        isometricId: true,
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
        ports: {
          include: {
            diameter: true,
          },
          omit: {
            diameterId: true,
            fittingId: true,
          },
        },
        isometric: {
          include: {
            sheet: {
              omit: { isometricId: true },
            },
          },
          omit: { projectId: true },
        },
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
        isometricId: true,
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
        ports: {
          include: {
            diameter: true,
          },
          omit: {
            diameterId: true,
            fittingId: true,
          },
        },
        isometric: {
          include: {
            sheet: {
              omit: { isometricId: true },
            },
          },
          omit: { projectId: true },
        },
      },
      omit: {
        fittingTypeId: true,
        materialId: true,
        partId: true,
        isometricId: true,
      },
    });
  }
}
