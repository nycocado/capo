export interface HistogramData {
    bins: number[];
    counts: number[];
}

export interface BoxPlotData {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
}

export interface BarChartData {
    labels: string[];
    values: number[];
}

export interface PieChartData {
    segments: { label: string; value: number }[]
}

export interface ChartData {
    histogram: HistogramData;
    boxPlot: BoxPlotData;
    barChart: BarChartData;
    pieChart: PieChartData;
}