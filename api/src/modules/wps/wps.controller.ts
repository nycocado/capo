import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { WpsService } from "@modules/wps/wps.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse } from "@common/decorators";
import { WpsResponseDto } from "@modules/wps/dto";
import { WpsEntity } from "@modules/wps/entities";

@Controller("wps")
export class WpsController {
  constructor(private readonly wpsService: WpsService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "administrator")
  @Get()
  @SerializeResponse(WpsResponseDto, "wps")
  async getAllWps(): Promise<WpsEntity[]> {
    return this.wpsService.findAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "administrator")
  @Get(":id")
  @SerializeResponse(WpsResponseDto, "wps")
  async getWpsById(@Param("id") id: number): Promise<WpsEntity> {
    return this.wpsService.findOne(id);
  }
}
