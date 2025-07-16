import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { FillerMaterialService } from "@modules/filler-material/filler-material.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse } from "@common/decorators";
import { FillerMaterialResponseDto } from "@modules/filler-material/dto";

@Controller("filler-materials")
export class FillerMaterialController {
  constructor(private readonly fillerMaterialService: FillerMaterialService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "administrator")
  @Get()
  @SerializeResponse(FillerMaterialResponseDto, "filler-material")
  async getAllFillerMaterials(): Promise<FillerMaterialResponseDto[]> {
    return this.fillerMaterialService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "administrator")
  @Get(":id")
  @SerializeResponse(FillerMaterialResponseDto, "filler-material")
  async getFillerMaterialById(
    @Param("id") id: number,
  ): Promise<FillerMaterialResponseDto> {
    return this.fillerMaterialService.getById(id);
  }
}
