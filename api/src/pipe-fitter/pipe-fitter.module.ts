import { Module } from '@nestjs/common';
import { PipeFitterService } from './pipe-fitter.service';
import { PipeFitterController } from './pipe-fitter.controller';

@Module({
  controllers: [PipeFitterController],
  providers: [PipeFitterService],
  exports: [PipeFitterService],
})
export class PipeFitterModule {}
