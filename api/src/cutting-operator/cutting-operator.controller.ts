import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CuttingOperatorService } from './cutting-operator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('cutting-operator')
export class CuttingOperatorController {
  constructor(
    private readonly cuttingOperatorService: CuttingOperatorService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Boolean })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('verify')
  async verifyCuttingOperator(@Req() req: any) {
    return this.cuttingOperatorService.verifyCuttingOperator(req.user.id);
  }
}
