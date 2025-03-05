import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CuttingOperatorService } from '../cutting-operator/cutting-operator.service';
import { PipeFitterService } from '../pipe-fitter/pipe-fitter.service';

@Injectable()
export class PipeLengthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cuttingOperatorService: CuttingOperatorService,
    private readonly pipeFitterService: PipeFitterService,
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

  async findAllByIsometric(isometricId: number, userId: number) {
    await this.pipeFitterService.validatePipeFitter(userId);

    return this.databaseService.pipeLength.findMany({
      where: {
        isometricId: isometricId,
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

  async findAllWithoutHeatNumberAndCuttingOperator(userId: number) {
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

  async updateHeatNumber(id: number, heatNumber: string, userId: number) {
    const cuttingOperator =
      await this.cuttingOperatorService.validateCuttingOperator(userId);

    const existing = await this.databaseService.pipeLength.findUnique({
      where: { id },
      select: {
        cuttingOperatorId: true,
        heatNumber: true,
      },
    });

    if (!existing || existing.cuttingOperatorId !== cuttingOperator.id) {
      throw new UnauthorizedException('Not allowed to edit this pipe length');
    }

    if (!existing.heatNumber) {
      throw new BadRequestException(
        'Cannot edit heat number: pipe length does not have a heat number yet',
      );
    }

    return this.databaseService.pipeLength.update({
      where: { id },
      data: { heatNumber: heatNumber },
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
