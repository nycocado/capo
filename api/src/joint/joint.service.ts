import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JointService {
  constructor(private readonly databaseService: DatabaseService) {}

  async count(): Promise<number> {
    return this.databaseService.joint.count();
  }

  async countDone(): Promise<number> {
    return this.databaseService.joint.count({
      where: { pipefitterId: { not: null } },
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
        pipefitterId: { not: null },
        spool: {
          revs: { some: { sheet: { isometric: { projectId } } } },
        },
      },
    });
  }
}
