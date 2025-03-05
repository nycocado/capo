import { Module } from '@nestjs/common';
import { JointService } from './joint.service';
import { JointController } from './joint.controller';
import { PipeFitterModule } from '../pipe-fitter/pipe-fitter.module';

@Module({
  imports: [PipeFitterModule],
  controllers: [JointController],
  providers: [JointService],
  exports: [JointService],
})
export class JointModule {}
