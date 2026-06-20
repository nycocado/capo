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
import { CreatePipeLengthStatusEventDto } from "@modules/pipe-length/dto/create-pipe-length-status-event.dto";
import { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthStatusEventEntity } from "@modules/pipe-length/entities/pipe-length-status-event.entity";
import { CreatePipeLengthStatusEventCommand } from "@modules/pipe-length/application/commands";
import {
  GetPipeLengthQuery,
  GetPipeLengthStatusEventsQuery,
} from "@modules/pipe-length/application/queries";

@Controller("pipe-lengths")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class PipeLengthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(":id")
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<PipeLengthEntity> {
    return this.queryBus.execute<GetPipeLengthQuery, PipeLengthEntity>(
      new GetPipeLengthQuery({ id }),
    );
  }

  @Get(":id/status-events")
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PipeLengthStatusEventEntity[]> {
    return this.queryBus.execute<
      GetPipeLengthStatusEventsQuery,
      PipeLengthStatusEventEntity[]
    >(new GetPipeLengthStatusEventsQuery({ id }));
  }

  @Post(":id/status-events")
  @Roles("cutting-operator", "administrator")
  createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreatePipeLengthStatusEventDto,
    @User("id") userId: number,
  ): Promise<PipeLengthEntity> {
    return this.commandBus.execute<
      CreatePipeLengthStatusEventCommand,
      PipeLengthEntity
    >(
      new CreatePipeLengthStatusEventCommand({
        id,
        status: dto.status,
        heatNumber: dto.heatNumber,
        notes: dto.notes,
        userId,
      }),
    );
  }
}
