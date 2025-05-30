import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PipeFitterService } from '../pipe-fitter/pipe-fitter.service';

@Injectable()
export class JointService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly pipeFitterService: PipeFitterService,
  ) {}

  async findJointsWithoutPipefitter(userId: number) {
    await this.pipeFitterService.validatePipeFitter(userId);

    return this.databaseService.joint.findMany({
      where: { pipeFitterId: null },
      include: {
        spool: {
          include: {
            revs: {
              include: {
                sheet: {
                  include: { isometric: { omit: { projectId: true } } },
                  omit: { isometricId: true },
                },
              },
              omit: { spoolId: true, sheetId: true, document: true },
            },
          },
        },
        welds: {
          omit: { jointId: true, welderId: true, fillerId: true },
        },
      },
      omit: { pipeFitterId: true, spoolId: true, part1Id: true, part2Id: true },
    });
  }

  async updatePipeFitter(id: number, userId: number) {
    const pipeFitter = await this.pipeFitterService.validatePipeFitter(userId);

    const existing = await this.databaseService.joint.findUnique({
      where: { id: id },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new UnauthorizedException('Not allowed to edit this joint');
    }

    return this.databaseService.joint.update({
      where: { id: id },
      data: { pipeFitterId: pipeFitter.id },
      include: {
        spool: {
          include: {
            revs: {
              include: {
                sheet: {
                  include: { isometric: { omit: { projectId: true } } },
                  omit: { isometricId: true },
                },
              },
              omit: { spoolId: true, sheetId: true, document: true },
            },
          },
        },
        welds: {
          omit: { jointId: true, welderId: true, fillerId: true },
        },
      },
      omit: { pipeFitterId: true, spoolId: true, part1Id: true, part2Id: true },
    });
  }

  async count(): Promise<number> {
    return this.databaseService.joint.count();
  }

  async countDone(): Promise<number> {
    return this.databaseService.joint.count({
      where: { pipeFitterId: { not: null } },
    });
  }

  async countByProject(projectId: number): Promise<number> {
    return this.databaseService.joint.count({
      where: {
        spool: {
          revs: { some: { sheet: { isometric: { projectId } } } },
        },
      },
    });
  }

  async countDoneByProject(projectId: number): Promise<number> {
    return this.databaseService.joint.count({
      where: {
        pipeFitterId: { not: null },
        spool: {
          revs: { some: { sheet: { isometric: { projectId } } } },
        },
      },
    });
  }
}
