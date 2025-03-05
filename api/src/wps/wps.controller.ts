import { Controller, Get, Req, UseGuards, Param, Res, ParseIntPipe } from '@nestjs/common';
import { WpsService } from './wps.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('wps')
export class WpsController {
  constructor(private readonly wpsService: WpsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('weld')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  findForWelder(@Req() req: any) {
    return this.wpsService.findForWelder(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('document/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async findDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const filePath = await this.wpsService.findDocument(id, req.user.id);
    return res.sendFile(filePath);
  }
}
