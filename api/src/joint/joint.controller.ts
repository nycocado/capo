import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JointService } from './joint.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('joint')
export class JointController {
  constructor(private readonly jointService: JointService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('assembly')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async findJointsWithoutPipefitter(@Req() req: any) {
    return this.jointService.findJointsWithoutPipefitter(req.user.id);
  }
}
