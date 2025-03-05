import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PipeLengthService } from './pipe-length.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PipeLengthEntity } from './entity/pipe-length.entity';
import { CutDto } from './dto/cut.dto';

@Controller('pipe-length')
export class PipeLengthController {
  constructor(private readonly pipeLengthService: PipeLengthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cut')
  @ApiOkResponse({ type: [PipeLengthEntity] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findForCutting(@Req() req: any) {
    return this.pipeLengthService.findAllWithoutHeatNumberAndCuttingOperator(
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('assembly/:isometricId')
  @ApiOkResponse({ type: [PipeLengthEntity] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findForAssembly(
    @Param('isometricId', ParseIntPipe) isometricId: number,
    @Req() req: any,
  ) {
    return this.pipeLengthService.findAllByIsometric(isometricId, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('cut')
  @ApiOkResponse({ type: PipeLengthEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateForCutting(@Body() cutDto: CutDto, @Req() req: any) {
    const { pipeLengthId, heatNumber } = cutDto;
    return this.pipeLengthService.updateHeatNumberAndCuttingOperator(
      pipeLengthId,
      heatNumber,
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('edit/heat-number')
  @ApiOkResponse({ type: PipeLengthEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateHeatNumber(@Body() cutDto: CutDto, @Req() req: any) {
    const { pipeLengthId, heatNumber } = cutDto;
    return this.pipeLengthService.updateHeatNumber(
      pipeLengthId,
      heatNumber,
      req.user.id,
    );
  }
}
