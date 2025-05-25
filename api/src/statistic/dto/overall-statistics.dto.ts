import { ProgressStatistics } from '../entities/progress-statistics.entity';
import { PipeLengthStatistics } from '../entities/pipe-length-statistics.entity';
import { FittingTypeStatistics } from '../entities/fitting-type-statistics.entity';
import { ChartData } from '../entities/chart-data.entity';
import { DiameterFrequencyTable } from '../entities/diameter-frequency-table.entity';

export class OverallStatisticsDto {
  progress: ProgressStatistics;
  pipeLengths: PipeLengthStatistics;
  fittingTypes: FittingTypeStatistics;
  diameterFrequencies: DiameterFrequencyTable;
  chartData: ChartData;
}
