import { Module } from '@nestjs/common';
import { FillerService } from './filler.service';
import { FillerController } from './filler.controller';
import { WelderModule } from '../welder/welder.module';

@Module({
  imports: [WelderModule],
  controllers: [FillerController],
  providers: [FillerService],
})
export class FillerModule {}
