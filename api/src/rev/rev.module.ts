import { Module } from '@nestjs/common';
import { RevService } from './rev.service';
import { RevController } from './rev.controller';
import { PipeFitterModule } from '../pipe-fitter/pipe-fitter.module';

@Module({
  imports: [PipeFitterModule],
  controllers: [RevController],
  providers: [RevService],
})
export class RevModule {}
