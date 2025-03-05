import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly adminService: AdminService,
  ) {}

  findAll() {
    return this.databaseService.project.findMany({});
  }

  findOne(id: number) {
    return this.databaseService.project.findUnique({
      where: { id: id },
    });
  }

  async findAllForAdmin(userId: number) {
    await this.adminService.validateAdmin(userId);
    return this.databaseService.project.findMany({});
  }

  async findOneForAdmin(id: number, userId: number) {
    await this.adminService.validateAdmin(userId);
    return this.databaseService.project.findUniqueOrThrow({ where: { id } });
  }
}
