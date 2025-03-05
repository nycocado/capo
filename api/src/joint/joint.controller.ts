import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JointService } from './joint.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssemblyDto } from './dto/assembly.dto';

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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('assembly')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateForCutting(@Body() assemblyDto: AssemblyDto, @Req() req: any) {
    const { jointId } = assemblyDto;
    return this.jointService.updatePipeFitter(jointId, req.user.id);
  }
}
