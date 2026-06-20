import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CreateWeldStatusEventDto } from "@modules/weld/dto/create-weld-status-event.dto";
import { WeldEntity } from "@modules/weld/entities/weld.entity";
import { WeldStatusEventEntity } from "@modules/weld/entities/weld-status-event.entity";
import { CreateWeldStatusEventCommand } from "@modules/weld/application/commands";
import {
  GetWeldQuery,
  GetWeldStatusEventsQuery,
} from "@modules/weld/application/queries";

@Controller("welds")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class WeldController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(":id")
  @Roles("welder", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<WeldEntity> {
    return this.queryBus.execute<GetWeldQuery, WeldEntity>(
      new GetWeldQuery({ id }),
    );
  }

  @Get(":id/status-events")
  @Roles("welder", "administrator")
  getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<WeldStatusEventEntity[]> {
    return this.queryBus.execute<
      GetWeldStatusEventsQuery,
      WeldStatusEventEntity[]
    >(new GetWeldStatusEventsQuery({ id }));
  }

  @Post(":id/status-events")
  @Roles("welder", "administrator")
  createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateWeldStatusEventDto,
    @User("id") userId: number,
  ): Promise<WeldEntity> {
    return this.commandBus.execute<CreateWeldStatusEventCommand, WeldEntity>(
      new CreateWeldStatusEventCommand({
        id,
        status: dto.status,
        fillerMaterialId: dto.fillerMaterialId,
        wpsId: dto.wpsId,
        notes: dto.notes,
        userId,
      }),
    );
  }
}
