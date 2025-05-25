import { Module } from '@nestjs/common';
import { JointService } from './joint.service';
import { JointController } from './joint.controller';

@Module({
  controllers: [JointController],
  providers: [JointService],
  exports: [JointService],
})
export class JointModule {}
