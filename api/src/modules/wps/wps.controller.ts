import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { WpsService } from "@modules/wps/wps.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles } from "@common/decorators";
import { WpsEntity } from "@modules/wps/entities";

@Controller("wps")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@Roles("welder", "administrator")
export class WpsController {
  constructor(private readonly wpsService: WpsService) {}

  @Get()
  async getAll(): Promise<WpsEntity[]> {
    return this.wpsService.findAll();
  }

  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<WpsEntity> {
    return this.wpsService.findOne(id);
  }
}
