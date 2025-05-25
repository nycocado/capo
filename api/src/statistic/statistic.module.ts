import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { PipeLengthModule } from '../pipe-length/pipe-length.module';
import { AdminModule } from '../admin/admin.module';
import { FittingModule } from '../fitting/fitting.module';
import { WeldModule } from '../weld/weld.module';
import { JointModule } from '../joint/joint.module';

@Module({
  imports: [
    PipeLengthModule,
    FittingModule,
    WeldModule,
    JointModule,
    AdminModule,
  ],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
