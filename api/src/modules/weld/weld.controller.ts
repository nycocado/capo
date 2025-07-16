import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { WeldService } from "@modules/weld/weld.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse, User } from "@common/decorators";
import { WeldResponseDto } from "@modules/weld/dto";
import { WeldEntity } from "@modules/weld/entities";

@Controller("welds")
export class WeldController {
  constructor(private readonly weldService: WeldService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "welder", "admin")
  @Get()
  @SerializeResponse(WeldResponseDto, "weld")
  async getAllWelds(): Promise<WeldEntity[]> {
    return this.weldService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "welder", "admin")
  @Get(":id")
  @SerializeResponse(WeldResponseDto, "weld")
  async getWeldById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<WeldEntity> {
    return this.weldService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "admin")
  @Patch(":id/step")
  @SerializeResponse(WeldResponseDto, "weld")
  async updateWeldWorkStatus(
    @User("id") userId: number,
    @Param("id", ParseIntPipe) id: number,
    @Query("fillerMaterial") fillerMaterial?: string,
    @Query("wps") wps?: string,
    @Query("notes") notes?: string,
  ): Promise<WeldEntity> {
    return this.weldService.updateWorkStatus(
      id,
      userId,
      fillerMaterial,
      wps,
      notes,
    );
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "admin")
  @Patch(":id/filler-material")
  @SerializeResponse(WeldResponseDto, "weld")
  async updateFillerMaterial(
    @Param("id", ParseIntPipe) id: number,
    @Query("fillerMaterial") fillerMaterial?: string,
  ): Promise<WeldEntity> {
    return this.weldService.updateFillerMaterial(id, fillerMaterial);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("welder", "admin")
  @Patch(":id/wps")
  @SerializeResponse(WeldResponseDto, "weld")
  async updateWps(
    @Param("id", ParseIntPipe) id: number,
    @Query("wps") wps?: string,
  ): Promise<WeldEntity> {
    return this.weldService.updateWps(id, wps);
  }
}
