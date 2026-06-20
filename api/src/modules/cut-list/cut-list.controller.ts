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
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CutListEntity } from "@modules/cut-list/entities";
import { ReassignClaimDto } from "@shared/dto";
import {
  ClaimCutListCommand,
  ReassignCutListCommand,
  ReleaseCutListCommand,
} from "@modules/cut-list/application/commands";
import {
  GetCutListQuery,
  GetCutListsQuery,
  GetPendingCutCountQuery,
} from "@modules/cut-list/application/queries";

@Controller("cut-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class CutListController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles("cutting-operator", "administrator")
  getAll(): Promise<CutListEntity[]> {
    return this.queryBus.execute<GetCutListsQuery, CutListEntity[]>(
      new GetCutListsQuery(),
    );
  }

  // Declarado antes de ":id" para não ser capturado como parâmetro.
  @Get("pending-count")
  @Roles("cutting-operator", "administrator")
  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.queryBus.execute<GetPendingCutCountQuery, number>(
      new GetPendingCutCountQuery(),
    );
    return { count };
  }

  @Get(":id")
  @Roles("cutting-operator", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<CutListEntity> {
    return this.queryBus.execute<GetCutListQuery, CutListEntity>(
      new GetCutListQuery({ id }),
    );
  }

  @Post(":id/claim")
  @Roles("cutting-operator", "administrator")
  claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<CutListEntity> {
    return this.commandBus.execute<ClaimCutListCommand, CutListEntity>(
      new ClaimCutListCommand({ listId: id, userId }),
    );
  }

  @Delete(":id/claim")
  @Roles("cutting-operator", "administrator")
  release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<CutListEntity> {
    return this.commandBus.execute<ReleaseCutListCommand, CutListEntity>(
      new ReleaseCutListCommand({ listId: id, userId }),
    );
  }

  @Put(":id/claim")
  @Roles("administrator")
  reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<CutListEntity> {
    return this.commandBus.execute<ReassignCutListCommand, CutListEntity>(
      new ReassignCutListCommand({ listId: id, targetUserId: dto.userId }),
    );
  }
}
