import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { FillerMaterialService } from "@modules/filler-material/filler-material.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles } from "@common/decorators";
import { FillerMaterialEntity } from "@modules/filler-material/entities";

@Controller("filler-materials")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@Roles("welder", "administrator")
export class FillerMaterialController {
  constructor(private readonly fillerMaterialService: FillerMaterialService) {}

  @Get()
  async getAll(): Promise<FillerMaterialEntity[]> {
    return this.fillerMaterialService.getAll();
  }

  @Get(":id")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<FillerMaterialEntity> {
    return this.fillerMaterialService.getById(id);
  }
}
