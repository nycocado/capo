import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { WeldListService } from "@modules/weld-list/weld-list.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { WeldListEntity } from "@modules/weld-list/entities";
import { ReassignClaimDto } from "@shared/dto";

@Controller("weld-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class WeldListController {
  constructor(private readonly weldListService: WeldListService) {}

  @Get()
  @Roles("welder", "administrator")
  async getAll(): Promise<WeldListEntity[]> {
    return this.weldListService.getAll();
  }

  // Declarado antes de ":id" para não ser capturado como parâmetro.
  @Get("pending-count")
  @Roles("welder", "administrator")
  async getPendingCount(): Promise<{ count: number }> {
    return { count: await this.weldListService.getPendingCount() };
  }

  @Get(":id")
  @Roles("welder", "administrator")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<WeldListEntity> {
    return this.weldListService.getById(id);
  }

  @Post(":id/claim")
  @Roles("welder", "administrator")
  async claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<WeldListEntity> {
    return this.weldListService.claim(id, userId);
  }

  @Delete(":id/claim")
  @Roles("welder", "administrator")
  async release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<WeldListEntity> {
    return this.weldListService.release(id, userId);
  }

  @Put(":id/claim")
  @Roles("administrator")
  async reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<WeldListEntity> {
    return this.weldListService.reassign(id, dto.userId);
  }
}
