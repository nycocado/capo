import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async verifyAdmin(userId: number): Promise<boolean> {
    const admin = await this.databaseService.admin.findFirst({
      where: {
        userId: userId,
      },
    });

    return !!admin;
  }

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
}
