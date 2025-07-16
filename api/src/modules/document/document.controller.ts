import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles } from "@common/decorators";

@Controller("documents")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "pipe-fitter", "administrator")
  @Get(":section/:filename")
  getDocument(
    @Param("section") section: string,
    @Param("filename") filename: string,
  ) {
    return this.documentService.getDocument(section, filename);
  }
}
