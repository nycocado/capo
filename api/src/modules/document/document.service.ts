import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { createReadStream, existsSync } from "fs";
import { resolve, extname, sep } from "path";

@Injectable()
export class DocumentService {
  private readonly storagePath: string;

  // Secções servíveis (subpastas de storage); tudo o resto é rejeitado.
  private static readonly ALLOWED_SECTIONS = ["isometric", "wps"];

  constructor() {
    const envPath = process.env.STORAGE_PATH ?? "storage";
    this.storagePath = resolve(envPath);
  }

  /**
   * Serve um documento de uma secção permitida, protegendo contra path traversal.
   *
   * @param section Subpasta de storage (tem de constar da allowlist)
   * @param filename Nome do ficheiro pedido
   * @returns O ficheiro como stream com o MIME type adequado
   * @throws NotFoundException Se a secção não for permitida, o caminho escapar
   *   da secção, ou o ficheiro não existir
   */
  getDocument(section: string, filename: string): StreamableFile {
    if (!DocumentService.ALLOWED_SECTIONS.includes(section)) {
      throw new NotFoundException("File not found");
    }

    const sectionRoot = resolve(this.storagePath, section);
    const filePath = resolve(sectionRoot, filename);

    // O caminho resolvido tem de ficar contido na secção (bloqueia `../`).
    if (filePath !== sectionRoot && !filePath.startsWith(sectionRoot + sep)) {
      throw new NotFoundException("File not found");
    }

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    const fileStream = createReadStream(filePath);
    const type = this.getMimeType(filename);
    return new StreamableFile(fileStream, { type });
  }

  private getMimeType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    switch (ext) {
      case ".pdf":
        return "application/pdf";
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      default:
        return "application/octet-stream";
    }
  }
}
