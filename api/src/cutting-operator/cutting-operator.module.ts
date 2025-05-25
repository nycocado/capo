import { Module } from '@nestjs/common';
import { CuttingOperatorService } from './cutting-operator.service';
import { CuttingOperatorController } from './cutting-operator.controller';

@Module({
  controllers: [CuttingOperatorController],
  providers: [CuttingOperatorService],
  exports: [CuttingOperatorService],
})
export class CuttingOperatorModule {}
