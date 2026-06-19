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
import { CutListService } from "@modules/cut-list/cut-list.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CutListEntity } from "@modules/cut-list/entities";
import { ReassignClaimDto } from "@shared/dto";

@Controller("cut-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class CutListController {
  constructor(private readonly cutListService: CutListService) {}

  @Get()
  @Roles("cutting-operator", "administrator")
  async getAll(): Promise<CutListEntity[]> {
    return this.cutListService.getAll();
  }

  // Declarado antes de ":id" para não ser capturado como parâmetro.
  @Get("pending-count")
  @Roles("cutting-operator", "administrator")
  async getPendingCount(): Promise<{ count: number }> {
    return { count: await this.cutListService.getPendingCount() };
  }

  @Get(":id")
  @Roles("cutting-operator", "administrator")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<CutListEntity> {
    return this.cutListService.getById(id);
  }

  @Post(":id/claim")
  @Roles("cutting-operator", "administrator")
  async claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<CutListEntity> {
    return this.cutListService.claim(id, userId);
  }

  @Delete(":id/claim")
  @Roles("cutting-operator", "administrator")
  async release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<CutListEntity> {
    return this.cutListService.release(id, userId);
  }

  @Put(":id/claim")
  @Roles("administrator")
  async reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<CutListEntity> {
    return this.cutListService.reassign(id, dto.userId);
  }
}
