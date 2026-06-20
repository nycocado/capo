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
import { CreateJointStatusEventDto } from "@modules/joint/dto";
import { JointEntity, JointStatusEventEntity } from "@modules/joint/entities";
import { CreateJointStatusEventCommand } from "@modules/joint/application/commands";
import {
  GetJointQuery,
  GetJointStatusEventsQuery,
} from "@modules/joint/application/queries";

@Controller("joints")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class JointController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(":id")
  @Roles("pipe-fitter", "welder", "administrator")
  getById(@Param("id", ParseIntPipe) id: number): Promise<JointEntity> {
    return this.queryBus.execute<GetJointQuery, JointEntity>(
      new GetJointQuery({ id }),
    );
  }

  @Get(":id/status-events")
  @Roles("pipe-fitter", "welder", "administrator")
  getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<JointStatusEventEntity[]> {
    return this.queryBus.execute<
      GetJointStatusEventsQuery,
      JointStatusEventEntity[]
    >(new GetJointStatusEventsQuery({ id }));
  }

  @Post(":id/status-events")
  @Roles("pipe-fitter", "administrator")
  createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateJointStatusEventDto,
    @User("id") userId: number,
  ): Promise<JointEntity> {
    return this.commandBus.execute<CreateJointStatusEventCommand, JointEntity>(
      new CreateJointStatusEventCommand({
        id,
        status: dto.status,
        notes: dto.notes,
        userId,
      }),
    );
  }
}
