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
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { ReassignClaimDto } from "@shared/dto";
import {
  ClaimWeldListCommand,
  ReassignWeldListCommand,
  ReleaseWeldListCommand,
} from "@modules/weld-list/application/commands";
import {
  GetPendingWeldCountQuery,
  GetWeldListQuery,
  GetWeldListsQuery,
} from "@modules/weld-list/application/queries";

@Controller("weld-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class WeldListController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles("welder", "administrator")
  getAll(): Promise<WeldListEntity[]> {
    return this.queryBus.execute<GetWeldListsQuery, WeldListEntity[]>(
      new GetWeldListsQuery(),
    );
  }

  // Declarado antes de ":id" para não ser capturado como parâmetro.
  @Get("pending-count")
  @Roles("welder", "administrator")
  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.queryBus.execute<GetPendingWeldCountQuery, number>(
      new GetPendingWeldCountQuery(),
    );
    return { count };
  }

  @Get(":id")
  @Roles("welder", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<WeldListEntity> {
    return this.queryBus.execute<GetWeldListQuery, WeldListEntity>(
      new GetWeldListQuery({ id }),
    );
  }

  @Post(":id/claim")
  @Roles("welder", "administrator")
  claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<WeldListEntity> {
    return this.commandBus.execute<ClaimWeldListCommand, WeldListEntity>(
      new ClaimWeldListCommand({ listId: id, userId }),
    );
  }

  @Delete(":id/claim")
  @Roles("welder", "administrator")
  release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<WeldListEntity> {
    return this.commandBus.execute<ReleaseWeldListCommand, WeldListEntity>(
      new ReleaseWeldListCommand({ listId: id, userId }),
    );
  }

  @Put(":id/claim")
  @Roles("administrator")
  reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<WeldListEntity> {
    return this.commandBus.execute<ReassignWeldListCommand, WeldListEntity>(
      new ReassignWeldListCommand({ listId: id, targetUserId: dto.userId }),
    );
  }
}
