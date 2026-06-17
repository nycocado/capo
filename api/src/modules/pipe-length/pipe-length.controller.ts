import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PipeLengthService } from "@modules/pipe-length/pipe-length.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CreatePipeLengthStatusEventDto } from "@modules/pipe-length/dto";
import {
  PipeLengthEntity,
  PipeLengthStatusEventEntity,
} from "@modules/pipe-length/entities";

@Controller("pipe-lengths")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class PipeLengthController {
  constructor(private readonly pipeLengthService: PipeLengthService) {}

  @Get(":id")
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  async getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PipeLengthEntity> {
    return this.pipeLengthService.getById(id);
  }

  @Get(":id/status-events")
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  async getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PipeLengthStatusEventEntity[]> {
    return this.pipeLengthService.getStatusEvents(id);
  }

  @Post(":id/status-events")
  @Roles("cutting-operator", "administrator")
  async createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreatePipeLengthStatusEventDto,
    @User("id") userId: number,
  ): Promise<PipeLengthEntity> {
    return this.pipeLengthService.createStatusEvent(id, dto, userId);
  }
}
