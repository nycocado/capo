import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PipeLengthService } from "@modules/pipe-length/pipe-length.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse, User } from "@common/decorators";
import { PipeLengthResponseDto } from "@modules/pipe-length/dto";
import { PipeLengthEntity } from "@modules/pipe-length/entities";

@Controller("pipe-lengths")
export class PipeLengthController {
  constructor(private readonly pipeLengthService: PipeLengthService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  @Get()
  @SerializeResponse(PipeLengthResponseDto, "pipe-length")
  async getAllPipeLengths(): Promise<PipeLengthEntity[]> {
    return this.pipeLengthService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("cutting-operator", "pipe-fitter", "administrator")
  @Get(":id")
  @SerializeResponse(PipeLengthResponseDto, "pipe-length")
  async getPipeLengthById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PipeLengthEntity> {
    return this.pipeLengthService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("cutting-operator", "administrator")
  @Patch(":id/step")
  @SerializeResponse(PipeLengthResponseDto, "pipe-length")
  async updatePipeLengthWorkStatus(
    @User("id") userId: number,
    @Param("id", ParseIntPipe) id: number,
    @Query("heatNumber") heatNumber?: string,
    @Query("notes") notes?: string,
  ) {
    return this.pipeLengthService.updateWorkStatus(
      id,
      userId,
      heatNumber,
      notes,
    );
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("cutting-operator", "administrator")
  @Patch(":id/heat-number")
  @SerializeResponse(PipeLengthResponseDto, "pipe-length")
  async updatePipeLengthHeatNumber(
    @Param("id", ParseIntPipe) id: number,
    @Query("heatNumber") heatNumber: string,
  ) {
    return this.pipeLengthService.updateHeatNumber(id, heatNumber);
  }
}
