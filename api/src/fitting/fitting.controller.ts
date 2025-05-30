import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FittingService } from './fitting.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('assembly/:isometricId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findForAssembly(
    @Param('isometricId', ParseIntPipe) isometricId: number,
    @Req() req: any,
  ) {
    return this.fittingService.findAllByIsometric(isometricId, req.user.id);
  }
}
