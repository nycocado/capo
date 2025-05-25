import { Module } from '@nestjs/common';
import { WeldService } from './weld.service';
import { WeldController } from './weld.controller';

@Module({
  controllers: [WeldController],
  providers: [WeldService],
  exports: [WeldService],
})
export class WeldModule {}
