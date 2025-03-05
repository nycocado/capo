import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PipeFitterService } from './pipe-fitter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('pipe-fitter')
export class PipeFitterController {
  constructor(private readonly pipeFitterService: PipeFitterService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('verify')
  verifyPipeFitter(@Req() req: any) {
    return this.pipeFitterService.verifyPipeFitter(req.user.id);
  }
}
