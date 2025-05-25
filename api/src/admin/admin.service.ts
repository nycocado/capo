import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateAdmin(userId: number) {
    const admin = await this.databaseService.admin.findFirst({
      where: { userId: userId },
      include: { user: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return admin;
  }

  async verifyAdmin(userId: number) {
    const admin = await this.validateAdmin(userId);
    return !!admin;
  }
}
