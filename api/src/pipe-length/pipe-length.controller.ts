import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { PipeLengthService } from './pipe-length.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PipeLengthEntity } from './entity/pipe-length.entity';
import { CutDto } from './dt/cut.dto';

@Controller('pipe-length')
export class PipeLengthController {
  constructor(private readonly pipeLengthService: PipeLengthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('cut')
  @ApiOkResponse({ type: [PipeLengthEntity] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findForCutting(@Req() req: any) {
    return this.pipeLengthService.findWithoutHeatNumberAndCuttingOperator(
      req.user.id,
    );
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
}
