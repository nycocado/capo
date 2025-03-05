import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CuttingOperatorService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validateCuttingOperator(userId: number) {
    const cuttingOperator =
      await this.databaseService.cuttingOperator.findFirst({
        where: { userId: userId },
        include: { user: true },
      });

    if (!cuttingOperator) {
      throw new UnauthorizedException('Cutting operator not found');
    }

    return cuttingOperator;
  }

  async verifyCuttingOperator(userId: number) {
    const cuttingOperator = await this.validateCuttingOperator(userId);
    return !!cuttingOperator;
  }
}
