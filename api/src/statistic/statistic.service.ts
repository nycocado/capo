import { Injectable, NotFoundException } from '@nestjs/common';
import { PipeLengthService } from '../pipe-length/pipe-length.service';
import { PipeLengthStatistics } from './entities/pipe-length-statistics.entity';
import { AdminService } from '../admin/admin.service';
import { FittingTypeStatistics } from './entities/fitting-type-statistics.entity';
import { FittingService } from '../fitting/fitting.service';
import { DiameterFrequencyTable } from './entities/diameter-frequency-table.entity';
import {
  BarChartData,
  BoxPlotData,
  ChartData,
  HistogramData,
  PieChartData,
} from './entities/chart-data.entity';
import { WeldService } from '../weld/weld.service';
import { JointService } from '../joint/joint.service';
import { ProjectService } from '../project/project.service';
import { ProgressStatistics } from './entities/progress-statistics.entity';
import { OverallStatisticsDto } from './dto/overall-statistics.dto';

@Injectable()
export class StatisticService {
  constructor(
    private readonly pipeLengthService: PipeLengthService,
    private readonly fittingService: FittingService,
    private readonly weldService: WeldService,
    private readonly jointService: JointService,
    private readonly adminService: AdminService,
    private readonly projectService: ProjectService,
  ) {}

  avg(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const avg = this.avg(numbers);
    const variance =
      numbers.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) /
      numbers.length;
    return Math.sqrt(variance);
  }

  median(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  mode<T>(items: T[]): T[] {
    if (items.length === 0) return [];

    const frequency = new Map<T, number>();
    let maxFreq = 0;

    for (const item of items) {
      const count = (frequency.get(item) || 0) + 1;
      frequency.set(item, count);
      maxFreq = Math.max(maxFreq, count);
    }

    return Array.from(frequency.entries())
      .filter(([, count]) => count === maxFreq)
      .map(([item]) => item);
  }

  quartile(numbers: number[], quartile: 1 | 2 | 3): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    switch (quartile) {
      case 1:
        return this.median(sorted.slice(0, mid));
      case 2:
        return this.median(sorted);
      case 3: {
        const start = sorted.length % 2 === 0 ? mid : mid + 1;
        return this.median(sorted.slice(start));
      }
      default:
        return 0;
    }
  }

  q1(numbers: number[]): number {
    return this.quartile(numbers, 1);
  }

  q3(numbers: number[]): number {
    return this.quartile(numbers, 3);
  }

  async makePipeLengthStatisticsByProject(
    projectId: number,
  ): Promise<PipeLengthStatistics> {
    const pipeLengths =
      await this.pipeLengthService.findAllByProject(projectId);
    const lengths = pipeLengths.map((pipe) => pipe.length.toNumber());
    return {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      median: this.median(lengths),
      thicknessStandardDeviation: this.standardDeviation(
        pipeLengths.map((pipe) => pipe.thickness.toNumber()),
      ),
    };
  }

  async makeFittingTypeStatisticsByProject(
    projectId: number,
  ): Promise<FittingTypeStatistics> {
    const fittings = await this.fittingService.findAllByProject(projectId);
    const fittingTypes = fittings.map((f) => f.fittingType.name);
    return { modes: this.mode(fittingTypes) };
  }

  async makeDiameterStatisticsByProject(
    projectId: number,
  ): Promise<DiameterFrequencyTable> {
    const pipeLengths =
      await this.pipeLengthService.findAllByProject(projectId);
    const diameters = pipeLengths.map((pipe) => pipe.diameter);
    const frequencyMap = new Map<
      number,
      { mm: number; inch: number; count: number }
    >();
    for (const diameter of diameters) {
      const mm = diameter.nominalMm.toNumber();
      const inch = diameter.nominalInch.toNumber();
      const entry = frequencyMap.get(mm);
      if (entry) entry.count++;
      else frequencyMap.set(mm, { mm, inch, count: 1 });
    }
    return {
      frequencies: Array.from(frequencyMap.values()).map(
        ({ mm, inch, count }) => ({
          nominalDiameterMm: mm,
          nominalDiameterInch: inch,
          absoluteFrequency: count,
          relativeFrequency: count / diameters.length,
        }),
      ),
    };
  }

  async makeProgressStatisticsByProject(
    projectId: number,
  ): Promise<ProgressStatistics> {
    const totalPipeLengths =
      await this.pipeLengthService.countByProject(projectId);
    const donePipeLengths =
      await this.pipeLengthService.countDoneByProject(projectId);
    const totalWelds = await this.weldService.countByProject(projectId);
    const doneWelds = await this.weldService.countDoneByProject(projectId);
    const totalJoints = await this.jointService.countByProject(projectId);
    const doneJoints = await this.jointService.countDoneByProject(projectId);
    const totalItems = totalPipeLengths + totalWelds + totalJoints;
    const doneItems = donePipeLengths + doneWelds + doneJoints;
    const avgProgress = totalItems === 0 ? 0 : (doneItems / totalItems) * 100;
    return { avgProgress };
  }

  async makeHistogramDataByProject(projectId: number): Promise<HistogramData> {
    const pipeLengths =
      await this.pipeLengthService.findAllByProject(projectId);
    const lengths = pipeLengths.map((pipe) => pipe.length.toNumber());
    const numBins = Math.ceil(Math.sqrt(lengths.length));
    const sorted = [...lengths].sort((a, b) => a - b);
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const size = (max - min) / numBins;
    const bins = Array.from({ length: numBins + 1 }, (_, i) => min + size * i);
    const counts = Array(numBins).fill(0);
    lengths.forEach((len) => {
      const idx = Math.min(Math.floor((len - min) / size), numBins - 1);
      counts[idx]++;
    });
    return { bins, counts };
  }

  async makeBoxPlotDataByProject(projectId: number): Promise<BoxPlotData> {
    const pipeLengths =
      await this.pipeLengthService.findAllByProject(projectId);
    const thick = pipeLengths.map((pipe) => pipe.thickness.toNumber());
    const sorted = [...thick].sort((a, b) => a - b);
    const min = sorted[0] ?? 0;
    const max = sorted[sorted.length - 1] ?? 0;
    const q1 = this.q1(thick);
    const median = this.quartile(thick, 2);
    const q3 = this.q3(thick);
    return { min, q1, median, q3, max };
  }

  async makeBarChartDataByProject(projectId: number): Promise<BarChartData> {
    const fittings = await this.fittingService.findAllByProject(projectId);
    const names = fittings.map((f) => f.fittingType.name);
    const freq = new Map<string, number>();
    names.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1));
    const labels = Array.from(freq.keys());
    const values = labels.map((l) => freq.get(l) ?? 0);
    return { labels, values };
  }

  async makePieChartDataByProject(projectId: number): Promise<PieChartData> {
    const { avgProgress } =
      await this.makeProgressStatisticsByProject(projectId);
    return {
      segments: [
        { label: 'Finished', value: avgProgress },
        { label: 'To do', value: 100 - avgProgress },
      ],
    };
  }

  async makeChartDataByProject(projectId: number): Promise<ChartData> {
    return {
      histogram: await this.makeHistogramDataByProject(projectId),
      boxPlot: await this.makeBoxPlotDataByProject(projectId),
      barChart: await this.makeBarChartDataByProject(projectId),
      pieChart: await this.makePieChartDataByProject(projectId),
    };
  }

  async makeOverallStatisticsByProject(
    projectId: number,
  ): Promise<OverallStatisticsDto> {
    const pipeLengths = await this.makePipeLengthStatisticsByProject(projectId);
    const fittingTypes =
      await this.makeFittingTypeStatisticsByProject(projectId);
    const diameterFrequencies =
      await this.makeDiameterStatisticsByProject(projectId);
    const project = await this.projectService.findOne(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    const progress = await this.makeProgressStatisticsByProject(projectId);
    const chartData = await this.makeChartDataByProject(projectId);
    return {
      project,
      progress,
      pipeLengths,
      fittingTypes,
      diameterFrequencies,
      chartData,
    };
  }

  async getPipeLengthStatistics(
    userId: number,
    projectId: number,
  ): Promise<PipeLengthStatistics> {
    await this.adminService.validateAdmin(userId);
    return this.makePipeLengthStatisticsByProject(projectId);
  }

  async getFittingTypeStatistics(
    userId: number,
    projectId: number,
  ): Promise<FittingTypeStatistics> {
    await this.adminService.validateAdmin(userId);
    return this.makeFittingTypeStatisticsByProject(projectId);
  }

  async getDiameterStatistics(
    userId: number,
    projectId: number,
  ): Promise<DiameterFrequencyTable> {
    await this.adminService.validateAdmin(userId);
    return this.makeDiameterStatisticsByProject(projectId);
  }

  async getProgressStatistics(
    userId: number,
    projectId: number,
  ): Promise<ProgressStatistics> {
    await this.adminService.validateAdmin(userId);
    return this.makeProgressStatisticsByProject(projectId);
  }

  async getChartData(userId: number, projectId: number): Promise<ChartData> {
    await this.adminService.validateAdmin(userId);
    return this.makeChartDataByProject(projectId);
  }

  async getOverallStatistics(
    userId: number,
    projectId: number,
  ): Promise<OverallStatisticsDto> {
    await this.adminService.validateAdmin(userId);
    return this.makeOverallStatisticsByProject(projectId);
  }
}
