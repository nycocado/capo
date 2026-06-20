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
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { ReassignClaimDto } from "@shared/dto";
import {
  ClaimAssemblyListCommand,
  ReassignAssemblyListCommand,
  ReleaseAssemblyListCommand,
} from "@modules/assembly-list/application/commands";
import {
  GetAssemblyListQuery,
  GetAssemblyListsQuery,
  GetPendingAssemblyCountQuery,
} from "@modules/assembly-list/application/queries";

@Controller("assembly-lists")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class AssemblyListController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles("pipe-fitter", "administrator")
  getAll(): Promise<AssemblyListEntity[]> {
    return this.queryBus.execute<GetAssemblyListsQuery, AssemblyListEntity[]>(
      new GetAssemblyListsQuery(),
    );
  }

  // Declarado antes de ":id" para não ser capturado como parâmetro.
  @Get("pending-count")
  @Roles("pipe-fitter", "administrator")
  async getPendingCount(): Promise<{ count: number }> {
    const count = await this.queryBus.execute<
      GetPendingAssemblyCountQuery,
      number
    >(new GetPendingAssemblyCountQuery());
    return { count };
  }

  @Get(":id")
  @Roles("pipe-fitter", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<AssemblyListEntity> {
    return this.queryBus.execute<GetAssemblyListQuery, AssemblyListEntity>(
      new GetAssemblyListQuery({ id }),
    );
  }

  @Post(":id/claim")
  @Roles("pipe-fitter", "administrator")
  claim(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<AssemblyListEntity> {
    return this.commandBus.execute<
      ClaimAssemblyListCommand,
      AssemblyListEntity
    >(new ClaimAssemblyListCommand({ listId: id, userId }));
  }

  @Delete(":id/claim")
  @Roles("pipe-fitter", "administrator")
  release(
    @Param("id", ParseIntPipe) id: number,
    @User("id") userId: number,
  ): Promise<AssemblyListEntity> {
    return this.commandBus.execute<
      ReleaseAssemblyListCommand,
      AssemblyListEntity
    >(new ReleaseAssemblyListCommand({ listId: id, userId }));
  }

  @Put(":id/claim")
  @Roles("administrator")
  reassign(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReassignClaimDto,
  ): Promise<AssemblyListEntity> {
    return this.commandBus.execute<
      ReassignAssemblyListCommand,
      AssemblyListEntity
    >(
      new ReassignAssemblyListCommand({ listId: id, targetUserId: dto.userId }),
    );
  }
}
