import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CuttingOperatorService } from '../cutting-operator/cutting-operator.service';

@Injectable()
export class PipeLengthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cuttingOperatorService: CuttingOperatorService,
  ) {}

  async findAll() {
    return this.databaseService.pipeLength.findMany({
      include: {
        material: true,
        diameter: true,
        part: true,
        isometric: {
          include: { sheet: { omit: { isometricId: true } } },
          omit: { projectId: true },
        },
        cuttingOperator: false,
      },
      omit: {
        materialId: true,
        diameterId: true,
        partId: true,
        cuttingOperatorId: true,
        isometricId: true,
      },
    });
  }

  async findAllByProject(projectId: number) {
    return this.databaseService.pipeLength.findMany({
      where: {
        isometric: {
          projectId: projectId,
        },
      },
      include: {
        material: true,
        diameter: true,
        part: true,
        isometric: {
          include: {
            sheet: {
              omit: { isometricId: true },
            },
          },
          omit: { projectId: true },
        },
        cuttingOperator: false,
      },
      omit: {
        materialId: true,
        diameterId: true,
        partId: true,
        cuttingOperatorId: true,
        isometricId: true,
      },
    });
  }

  async findOne(id: number) {
    return this.databaseService.pipeLength.findUnique({
      where: {
        id: id,
      },
      include: {
        material: true,
        diameter: true,
        part: true,
        isometric: {
          include: { sheet: { omit: { isometricId: true } } },
          omit: { projectId: true },
        },
        cuttingOperator: false,
      },
      omit: {
        materialId: true,
        diameterId: true,
        partId: true,
        cuttingOperatorId: true,
        isometricId: true,
      },
    });
  }

  async findWithoutHeatNumberAndCuttingOperator(userId: number) {
    await this.cuttingOperatorService.validateCuttingOperator(userId);

    return this.databaseService.pipeLength.findMany({
      where: {
        heatNumber: null,
        cuttingOperatorId: null,
      },
      include: {
        material: true,
        diameter: true,
        part: true,
        isometric: {
          include: { sheet: { omit: { isometricId: true } } },
          omit: { projectId: true },
        },
        cuttingOperator: false,
      },
      omit: {
        materialId: true,
        diameterId: true,
        partId: true,
        cuttingOperatorId: true,
        isometricId: true,
      },
    });
  }

  async updateHeatNumberAndCuttingOperator(
    id: number,
    heatNumber: string,
    userId: number,
  ) {
    const cuttingOperator =
      await this.cuttingOperatorService.validateCuttingOperator(userId);

    return this.databaseService.pipeLength.update({
      where: { id },
      data: {
        heatNumber,
        cuttingOperatorId: cuttingOperator.id,
      },
      include: {
        material: true,
        diameter: true,
        part: true,
        isometric: {
          include: { sheet: { omit: { isometricId: true } } },
          omit: { projectId: true },
        },
        cuttingOperator: false,
      },
      omit: {
        materialId: true,
        diameterId: true,
        partId: true,
        cuttingOperatorId: true,
        isometricId: true,
      },
    });
  }

  async count(): Promise<number> {
    return this.databaseService.pipeLength.count();
  }

  async countDone(): Promise<number> {
    return this.databaseService.pipeLength.count({
      where: {
        heatNumber: { not: null },
        cuttingOperatorId: { not: null },
      },
    });
  }

  async countByProject(projectId: number): Promise<number> {
    return this.databaseService.pipeLength.count({
      where: { isometric: { projectId } },
    });
  }

  async countDoneByProject(projectId: number): Promise<number> {
    return this.databaseService.pipeLength.count({
      where: {
        heatNumber: { not: null },
        cuttingOperatorId: { not: null },
        isometric: { projectId },
      },
    });
  }
}
