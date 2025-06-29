import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { resolve, extname } from 'path';

@Injectable()
export class DocumentService {
  private readonly storagePath: string;

  constructor() {
    const envPath = process.env.STORAGE_PATH ?? 'storage';
    this.storagePath = resolve(envPath);
  }

  getDocument(section: string, filename: string): StreamableFile {
    const filePath = resolve(this.storagePath, section, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    const fileStream = createReadStream(filePath);
    const type = this.getMimeType(filename);
    return new StreamableFile(fileStream, { type });
  }

  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    switch (ext) {
      case '.pdf':
        return 'application/pdf';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }
}
