import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles } from "@common/decorators";
import { GetDocumentQuery } from "@modules/document/application/queries";

@Controller("documents")
export class DocumentController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "pipe-fitter", "administrator")
  @Get(":section/:filename")
  getDocument(
    @Param("section") section: string,
    @Param("filename") filename: string,
  ): Promise<StreamableFile> {
    return this.queryBus.execute<GetDocumentQuery, StreamableFile>(
      new GetDocumentQuery({ section, filename }),
    );
  }
}
