import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { RevService } from './rev.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('rev')
export class RevController {
  constructor(private readonly revService: RevService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('document/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findDocument(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const filePath = await this.revService.findDocument(id, req.user.id);
    return res.sendFile(filePath);
  }
}
