import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PipeFitterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async validatePipeFitter(userId: number) {
    const pipeFitter = await this.databaseService.pipeFitter.findFirst({
      where: { userId: userId },
      include: { user: true },
    });

    if (!pipeFitter) {
      throw new UnauthorizedException('Pipe fitter not found');
    }

    return pipeFitter;
  }

  async verifyPipeFitter(userId: number) {
    const pipeFitter = await this.validatePipeFitter(userId);
    return !!pipeFitter;
  }
}
