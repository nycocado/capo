import { Controller, Get, Req, Param, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PipeLengthStatistics } from './entities/pipe-length-statistics.entity';
import { FittingTypeStatistics } from './entities/fitting-type-statistics.entity';
import { DiameterFrequencyTable } from './entities/diameter-frequency-table.entity';
import { ProgressStatistics } from './entities/progress-statistics.entity';
import { OverallStatisticsDto } from './dto/overall-statistics.dto';
import { ProjectIdParamDto } from './dto/project-id-param.dto';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('pipe-length/:projectId')
  @ApiOkResponse({ type: [PipeLengthStatistics] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getPipeLengthStatistics(@Req() req: any, @Param() params: ProjectIdParamDto) {
    return this.statisticService.getPipeLengthStatistics(
      req.user.id,
      params.projectId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('fitting-type/:projectId')
  @ApiOkResponse({ type: [FittingTypeStatistics] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getFittingTypeStatistics(
    @Req() req: any,
    @Param() params: ProjectIdParamDto,
  ) {
    return this.statisticService.getFittingTypeStatistics(
      req.user.id,
      params.projectId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('diameter/:projectId')
  @ApiOkResponse({ type: [DiameterFrequencyTable] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getDiameterFrequencyTable(
    @Req() req: any,
    @Param() params: ProjectIdParamDto,
  ) {
    return this.statisticService.getDiameterStatistics(
      req.user.id,
      params.projectId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('progress/:projectId')
  @ApiOkResponse({ type: ProgressStatistics })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProgressStatistics(@Req() req: any, @Param() params: ProjectIdParamDto) {
    return this.statisticService.getProgressStatistics(
      req.user.id,
      params.projectId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('chart-data/:projectId')
  @ApiOkResponse({ type: OverallStatisticsDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getChartData(@Req() req: any, @Param() params: ProjectIdParamDto) {
    return this.statisticService.getChartData(req.user.id, params.projectId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('overall/:projectId')
  @ApiOkResponse({ type: OverallStatisticsDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getOverallStatistics(@Req() req: any, @Param() params: ProjectIdParamDto) {
    return this.statisticService.getOverallStatistics(
      req.user.id,
      params.projectId,
    );
  }
}
