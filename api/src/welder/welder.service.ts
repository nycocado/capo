import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WelderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async verifyWelder(userId: number): Promise<boolean> {
    const welder = await this.databaseService.welder.findFirst({
      where: { id: userId },
    });

    return !!welder;
  }
}
