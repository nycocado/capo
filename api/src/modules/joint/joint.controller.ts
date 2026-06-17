import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JointService } from "@modules/joint/joint.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, User } from "@common/decorators";
import { CreateJointStatusEventDto } from "@modules/joint/dto";
import { JointEntity, JointStatusEventEntity } from "@modules/joint/entities";

@Controller("joints")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
export class JointController {
  constructor(private readonly jointService: JointService) {}

  @Get(":id")
  @Roles("pipe-fitter", "welder", "administrator")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<JointEntity> {
    return this.jointService.getById(id);
  }

  @Get(":id/status-events")
  @Roles("pipe-fitter", "welder", "administrator")
  async getStatusEvents(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<JointStatusEventEntity[]> {
    return this.jointService.getStatusEvents(id);
  }

  @Post(":id/status-events")
  @Roles("pipe-fitter", "administrator")
  async createStatusEvent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CreateJointStatusEventDto,
    @User("id") userId: number,
  ): Promise<JointEntity> {
    return this.jointService.createStatusEvent(id, dto, userId);
  }
}
