import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PipeFitterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async verifyPipeFitter(userId: number): Promise<boolean> {
    const pipeFitter = await this.databaseService.pipeFitter.findFirst({
      where: { userId: userId },
    });

    return !!pipeFitter;
  }
}
