import { Module } from '@nestjs/common';
import { WpsService } from './wps.service';
import { WpsController } from './wps.controller';
import { WelderModule } from '../welder/welder.module';

@Module({
  imports: [WelderModule],
  controllers: [WpsController],
  providers: [WpsService],
})
export class WpsModule {}
