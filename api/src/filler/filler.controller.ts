import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FillerService } from './filler.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('filler')
export class FillerController {
  constructor(private readonly fillerService: FillerService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('weld')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  findForWelder(@Req() req: any) {
    return this.fillerService.findForWelder(req.user.id);
  }
}
