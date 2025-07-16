import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JointService } from "@modules/joint/joint.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse, User } from "@common/decorators";
import { JointResponseDto } from "@modules/joint/dto";
import { JointEntity } from "@modules/joint/entities";

@Controller("joints")
export class JointController {
  constructor(private readonly jointService: JointService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "administrator")
  @Get()
  @SerializeResponse(JointResponseDto, "joint")
  async getAllJoints(): Promise<JointEntity[]> {
    return this.jointService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "administrator")
  @Get(":id")
  @SerializeResponse(JointResponseDto, "joint")
  async getJointById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<JointEntity> {
    return this.jointService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "administrator")
  @Patch(":id/step")
  @SerializeResponse(JointResponseDto, "joint")
  async updateJointWorkStatus(
    @User("id") userId: number,
    @Param("id", ParseIntPipe) id: number,
    @Query("notes") notes?: string,
  ): Promise<JointEntity> {
    return this.jointService.updateWorkStatus(id, userId, notes);
  }
}
