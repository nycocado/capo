import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WelderService } from './welder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('welder')
export class WelderController {
  constructor(private readonly welderService: WelderService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('verify')
  verifyWelder(@Req() req: any) {
    return this.welderService.verifyWelder(req.user.id);
  }
}
