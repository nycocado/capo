import { NotFoundException, StreamableFile } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { createReadStream, existsSync } from "fs";
import { extname, resolve, sep } from "path";
import { GetDocumentQuery } from "@modules/document/application/queries";

@QueryHandler(GetDocumentQuery)
export class GetDocumentHandler implements IQueryHandler<GetDocumentQuery> {
  private readonly storagePath = resolve(process.env.STORAGE_PATH ?? "storage");

  private static readonly ALLOWED_SECTIONS = ["isometric", "wps"];

  execute({ data }: GetDocumentQuery): Promise<StreamableFile> {
    return Promise.resolve().then(() => this.load(data.section, data.filename));
  }

  private load(section: string, filename: string): StreamableFile {
    if (!GetDocumentHandler.ALLOWED_SECTIONS.includes(section)) {
      throw new NotFoundException("File not found");
    }

    const sectionRoot = resolve(this.storagePath, section);
    const filePath = resolve(sectionRoot, filename);

    if (filePath !== sectionRoot && !filePath.startsWith(sectionRoot + sep)) {
      throw new NotFoundException("File not found");
    }

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    return new StreamableFile(createReadStream(filePath), {
      type: this.getMimeType(filename),
    });
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
