import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { DatabaseService } from '../database/database.service';
import { PipeFitterService } from '../pipe-fitter/pipe-fitter.service';

const ROOT_DIR = process.cwd();
const STORAGE_DIR = path.join(ROOT_DIR, process.env.STORAGE_DIR!);
const ISOMETRIC_DIR = path.join(STORAGE_DIR, process.env.ISOMETRIC_DIR!);

@Injectable()
export class RevService {
  constructor(
    private readonly pipeFitterService: PipeFitterService,
    private readonly databaseService: DatabaseService,
  ) {}

  async findDocument(revId: number, userId: number) {
    await this.pipeFitterService.validatePipeFitter(userId);

    const document = await this.databaseService.rev.findUnique({
      where: { id: revId },
      select: { document: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.join(ISOMETRIC_DIR, document.document);
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }
    return filePath;
  }
}
