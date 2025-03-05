import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WelderService } from '../welder/welder.service';

@Injectable()
export class WeldService {
  constructor(
    private readonly welderService: WelderService,
    private readonly databaseService: DatabaseService,
  ) {}

  async findAllWithoudWelder(userId: number) {
    await this.welderService.validateWelder(userId);

    return this.databaseService.weld.findMany({
      where: { welderId: null },
      include: {
        joint: {
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
          },
          omit: {
            part1Id: true,
            part2Id: true,
            pipeFitterId: true,
          },
        },
        filler: true,
        wps: true,
      },
      omit: { welderId: true, jointId: true, fillerId: true, wpsId: true },
    });
  }

  async updateWpsAndFillerMaterialAndWelder(
    id: number,
    wpsId: number,
    fillerMaterialId: number,
    userId: number,
  ) {
    const welder = await this.welderService.validateWelder(userId);

    const existing = await this.databaseService.weld.findUnique({
      where: { id: id },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new UnauthorizedException('Not allowed to edit this weld.');
    }

    return this.databaseService.weld.update({
      where: { id: id },
      data: {
        wpsId: wpsId,
        fillerId: fillerMaterialId,
        welderId: welder.id,
      },
      include: {
        joint: {
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
          },
          omit: {
            part1Id: true,
            part2Id: true,
            pipeFitterId: true,
          },
        },
        filler: true,
        wps: true,
      },
      omit: { welderId: true, jointId: true, fillerId: true, wpsId: true },
    });
  }

  async updateFillerMaterial(
    id: number,
    fillerMaterial: number,
    userId: number,
  ) {
    const welder = await this.welderService.validateWelder(userId);

    const existing = await this.databaseService.weld.findUnique({
      where: { id: id },
      select: {
        id: true,
        welderId: true,
      },
    });

    if (!existing || existing.welderId !== welder.id) {
      throw new UnauthorizedException('Not allowed to edit this weld.');
    }

    return this.databaseService.weld.update({
      where: { id: id },
      data: {
        fillerId: fillerMaterial,
      },
      include: {
        joint: {
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
          },
          omit: {
            part1Id: true,
            part2Id: true,
            pipeFitterId: true,
          },
        },
        filler: true,
        wps: true,
      },
      omit: { welderId: true, jointId: true, fillerId: true, wpsId: true },
    });
  }

  async updateWps(
    id: number,
    wpsId: number,
    userId: number,
  ) {
    const welder = await this.welderService.validateWelder(userId);

    const existing = await this.databaseService.weld.findUnique({
      where: { id: id },
      select: {
        id: true,
        welderId: true,
      },
    });

    if (!existing || existing.welderId !== welder.id) {
      throw new UnauthorizedException('Not allowed to edit this weld.');
    }

    return this.databaseService.weld.update({
      where: { id: id },
      data: {
        wpsId: wpsId,
      },
      include: {
        joint: {
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
          },
          omit: {
            part1Id: true,
            part2Id: true,
            pipeFitterId: true,
          },
        },
        filler: true,
        wps: true,
      },
      omit: { welderId: true, jointId: true, fillerId: true, wpsId: true },
    });
  }

  async count(): Promise<number> {
    return this.databaseService.weld.count();
  }

  async countDone(): Promise<number> {
    return this.databaseService.weld.count({
      where: { welderId: { not: null } },
    });
  }

  async countByProject(projectId: number): Promise<number> {
    return this.databaseService.weld.count({
      where: {
        joint: {
          spool: {
            revs: {
              some: {
                sheet: { isometric: { projectId } },
              },
            },
          },
        },
      },
    });
  }

  async countDoneByProject(projectId: number): Promise<number> {
    return this.databaseService.weld.count({
      where: {
        welderId: { not: null },
        joint: {
          spool: {
            revs: {
              some: { sheet: { isometric: { projectId } } },
            },
          },
        },
      },
    });
  }
}
