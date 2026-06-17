import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { WeldService } from "@modules/weld/weld.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CreateWeldStatusEventDto } from "@modules/weld/dto";
import { WeldEntity, WeldStatusEventEntity } from "@modules/weld/entities";

@Controller("welds")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class WeldController {
  constructor(private readonly weldService: WeldService) {}

  @Get(":id")
  @Roles("welder", "administrator")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<WeldEntity> {
    return this.weldService.getById(id);
  }

  @Get(":id/status-events")
  @Roles("welder", "administrator")
  async getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<WeldStatusEventEntity[]> {
    return this.weldService.getStatusEvents(id);
  }

  @Post(":id/status-events")
  @Roles("welder", "administrator")
  async createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateWeldStatusEventDto,
    @User("id") userId: number,
  ): Promise<WeldEntity> {
    return this.weldService.createStatusEvent(id, dto, userId);
  }
}
