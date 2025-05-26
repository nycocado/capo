interface StatisticsData {
    project: { id: number, internalId: string, name: string, client: string };
    progress: { avgProgress: number };
    pipeLengths: {
        min: number;
        max: number;
        median: number;
        thicknessStandardDeviation: number;
    };
    fittingTypes: { modes: string[] };
    diameterFrequencies: {
        frequencies: {
            nominalDiameterMm: number;
            nominalDiameterInch: number;
            absoluteFrequency: number;
            relativeFrequency: number;
        }[];
    };
    chartData: {
        histogram: { bins: number[]; counts: number[] };
        boxPlot: { min: number; q1: number; median: number; q3: number; max: number };
        barChart: { labels: string[]; values: number[] };
        pieChart: { segments: { label: string; value: number }[] };
    };
}