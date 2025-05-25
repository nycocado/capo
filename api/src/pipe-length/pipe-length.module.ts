import { Module } from '@nestjs/common';
import { PipeLengthService } from './pipe-length.service';
import { PipeLengthController } from './pipe-length.controller';
import { CuttingOperatorModule } from '../cutting-operator/cutting-operator.module';

@Module({
  imports: [CuttingOperatorModule],
  controllers: [PipeLengthController],
  providers: [PipeLengthService],
  exports: [PipeLengthService],
})
export class PipeLengthModule {}
