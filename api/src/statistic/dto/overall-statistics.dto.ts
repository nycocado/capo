import { ProgressStatistics } from '../entities/progress-statistics.entity';
import { PipeLengthStatistics } from '../entities/pipe-length-statistics.entity';
import { FittingTypeStatistics } from '../entities/fitting-type-statistics.entity';
import { ChartData } from '../entities/chart-data.entity';
import { DiameterFrequencyTable } from '../entities/diameter-frequency-table.entity';
import { Project } from '@prisma/client';

export class OverallStatisticsDto {
  project: Project;
  progress: ProgressStatistics;
  pipeLengths: PipeLengthStatistics;
  fittingTypes: FittingTypeStatistics;
  diameterFrequencies: DiameterFrequencyTable;
  chartData: ChartData;
}
