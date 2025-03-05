import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { WeldService } from './weld.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeldingDto } from './dto/welding.dto';
import { FillerDto } from './dto/filler.dto';
import { WpsDto } from './dto/wps.dto';

@Controller('weld')
export class WeldController {
  constructor(private readonly weldService: WeldService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('welding')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async findJointsWithoutPipefitter(@Req() req: any) {
    return this.weldService.findAllWithoudWelder(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('welding')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateForWelding(@Body() weldingDto: WeldingDto, @Req() req: any) {
    const { weldId, wpsId, fillerMaterialId } = weldingDto;
    return this.weldService.updateWpsAndFillerMaterialAndWelder(
      weldId,
      wpsId,
      fillerMaterialId,
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('edit/filler-material')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateFillerMaterial(@Body() fillerDto: FillerDto, @Req() req: any) {
    const { weldId, fillerMaterialId } = fillerDto;
    return this.weldService.updateFillerMaterial(
      weldId,
      fillerMaterialId,
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('edit/wps')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateWps(@Body() wpsDto: WpsDto, @Req() req: any) {
    const { weldId, wpsId } = wpsDto;
    return this.weldService.updateWps(weldId, wpsId, req.user.id);
  }
}
