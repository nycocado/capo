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
import { AssemblyListService } from "@modules/assembly-list/assembly-list.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { ReassignClaimDto } from "@shared/dto";

@Controller("assembly-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class AssemblyListController {
  constructor(private readonly assemblyListService: AssemblyListService) {}

  @Get()
  @Roles("pipe-fitter", "administrator")
  async getAll(): Promise<AssemblyListEntity[]> {
    return this.assemblyListService.getAll();
  }

  @Get(":id")
  @Roles("pipe-fitter", "administrator")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListService.getById(id);
  }

  @Post(":id/claim")
  @Roles("pipe-fitter", "administrator")
  async claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListService.claim(id, userId);
  }

  @Delete(":id/claim")
  @Roles("pipe-fitter", "administrator")
  async release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListService.release(id, userId);
  }

  @Put(":id/claim")
  @Roles("administrator")
  async reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListService.reassign(id, dto.userId);
  }
}
