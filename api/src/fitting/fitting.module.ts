import { Module } from '@nestjs/common';
import { FittingService } from './fitting.service';
import { FittingController } from './fitting.controller';
import { PipeFitterModule } from '../pipe-fitter/pipe-fitter.module';

@Module({
  imports: [PipeFitterModule],
  controllers: [FittingController],
  providers: [FittingService],
  exports: [FittingService],
})
export class FittingModule {}
