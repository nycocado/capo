import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WelderService } from '../welder/welder.service';

@Injectable()
export class FillerService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly welderService: WelderService,
  ) {}

  async findAll() {
    return this.databaseService.filler.findMany();
  }

  async findForWelder(userId: number) {
    await this.welderService.validateWelder(userId);

    return this.findAll();
  }
}
