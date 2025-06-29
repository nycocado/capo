import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FittingService } from '@modules/fitting/fitting.service';
import { JwtCookieAuthGuard, RolesGuard } from '@common/guards';
import { Roles, SerializeResponse } from '@common/decorators';
import { FittingResponseDto } from '@modules/fitting/dto';
import { FittingEntity } from '@modules/fitting/entities';

@Controller('fittings')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('pipe-fitter', 'administrator')
  @Get()
  @SerializeResponse(FittingResponseDto, 'fitting')
  async getAllFittings(): Promise<FittingEntity[]> {
    return this.fittingService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('pipe-fitter', 'administrator')
  @Get(':id')
  @SerializeResponse(FittingResponseDto, 'fitting')
  async getFittingById(@Param('id') id: number): Promise<FittingEntity> {
    return this.fittingService.getById(id);
  }
}
