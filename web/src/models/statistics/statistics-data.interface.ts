import {Project} from "@models/project.interface";
import {ProgressStatistics} from "@models/statistics/progress-statistics.interface";
import {PipeLengthStatistics} from "@models/statistics/pipe-length-statistics.interface";
import {FittingTypeStatistics} from "@models/statistics/fitting-type-statistics.interface";
import {DiameterFrequencyTable} from "@models/statistics/diameter-frequency-table.interface";
import {ChartData} from "@models/statistics/chart-data.interface";

export interface StatisticsData {
    project: Project;
    progress: ProgressStatistics;
    pipeLengths: PipeLengthStatistics;
    fittingTypes: FittingTypeStatistics
    diameterFrequencies: DiameterFrequencyTable;
    chartData: ChartData;
}