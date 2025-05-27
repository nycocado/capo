export class HistogramData {
  bins: number[];
  counts: number[];
}

export class BoxPlotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export class BarChartData {
  labels: string[];
  values: number[];
}

export class PieChartData {
  segments: { label: string; value: number }[];
}

export class ChartData {
  histogram: HistogramData;
  boxPlot: BoxPlotData;
  barChart: BarChartData;
  pieChart: PieChartData;
}
