import { Module } from '@nestjs/common';
import { WeldService } from './weld.service';
import { WeldController } from './weld.controller';
import { WelderModule } from '../welder/welder.module';

@Module({
  imports: [WelderModule],
  controllers: [WeldController],
  providers: [WeldService],
  exports: [WeldService],
})
export class WeldModule {}
