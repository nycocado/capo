import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WelderService } from '../welder/welder.service';
import * as path from 'path';
import * as fs from 'fs/promises';

const ROOT_DIR = process.cwd();
const STORAGE_DIR = path.join(ROOT_DIR, process.env.STORAGE_DIR!);
const WPS_DIR = path.join(STORAGE_DIR, process.env.WPS_DIR!);

@Injectable()
export class WpsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly welderService: WelderService,
  ) {}

  async findAll() {
    return this.databaseService.wps.findMany();
  }

  async findForWelder(userId: number) {
    await this.welderService.validateWelder(userId);

    return this.findAll();
  }

  async findDocument(wpsId: number, userId: number) {
    await this.welderService.validateWelder(userId);

    const document = await this.databaseService.wps.findUnique({
      where: { id: wpsId },
      select: { document: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.join(WPS_DIR, document.document);
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }
    return filePath;
  }
}
