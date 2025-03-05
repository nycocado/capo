import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WelderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateWelder(userId: number) {
    const welder = await this.databaseService.welder.findFirst({
      where: { userId: userId },
      include: { user: true },
    });

    if (!welder) {
      throw new UnauthorizedException('Welder not found');
    }

    return welder;
  }

  async verifyWelder(userId: number) {
    const welder = await this.validateWelder(userId);
    return !!welder;
  }
}
