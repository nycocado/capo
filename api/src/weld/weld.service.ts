import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WeldService {
  constructor(private readonly databaseService: DatabaseService) {}

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
