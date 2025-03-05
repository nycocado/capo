'use client';

import React from 'react';
import {Container, Row, Col, Card, Table} from 'react-bootstrap';
import dynamic from 'next/dynamic';
import {StatisticsData} from '@models/statistics/statistics-data.interface';
import NavBar from "@components/layout/NavBar/NavBar";

const ReactECharts = dynamic(() => import('echarts-for-react'), {ssr: false});

export default function DashboardClient({data}: { data: StatisticsData }) {
    const pieData = [
        {name: 'Finished', value: parseFloat(data.progress.avgProgress.toFixed(2))},
        {name: 'To Do', value: parseFloat((100 - data.progress.avgProgress).toFixed(2))}
    ];

    const {counts} = data.chartData.histogram;
    const {min, max} = data.pipeLengths;
    const step = (max - min) / counts.length;

    const histogramLabels = counts.map((_, i) => {
        const start = Math.floor(min + i * step);
        const end = i === counts.length - 1 ? Math.ceil(max) : Math.floor(min + (i + 1) * step);
        return `${start}-${end}`;
    });

    const sortedFrequencies = [...data.diameterFrequencies.frequencies]
        .sort((a, b) => a.nominalDiameterMm - b.nominalDiameterMm);

    const chartOptions = {
        histogram: {
            xAxis: {type: 'category', data: histogramLabels},
            yAxis: {type: 'value'},
            series: [{type: 'bar', data: counts}]
        },
        boxplot: {
            xAxis: {type: 'category', data: ['Thickness']},
            yAxis: {type: 'value'},
            series: [{
                type: 'boxplot',
                data: [[
                    data.chartData.boxPlot.min,
                    data.chartData.boxPlot.q1,
                    data.chartData.boxPlot.median,
                    data.chartData.boxPlot.q3,
                    data.chartData.boxPlot.max
                ]]
            }]
        },
        barChart: {
            xAxis: {type: 'category', data: data.chartData.barChart.labels},
            yAxis: {type: 'value'},
            series: [{type: 'bar', data: data.chartData.barChart.values}]
        },
        pie: {
            tooltip: {
                trigger: 'item',
                formatter: function(params: any) {
                    return `${params.seriesName} <br/>${params.name}: ${params.value.toFixed(2)}%`;
                }
            },
            series: [{
                name: 'Progress',
                type: 'pie',
                radius: '50%',
                label: {
                    show: true,
                    formatter: function(params: any) {
                        return `${params.name}: ${params.value.toFixed(2)}%`;
                    }
                },
                data: pieData
            }]
        }
    };

    const StatCard = ({title, value}: { title: string; value: string }) => (
        <Col md={3}>
            <Card className="bg-white text-dark h-100 shadow-sm">
                <Card.Body className="d-flex flex-column justify-content-center text-center">
                    <h6 className="mb-3">{title}</h6>
                    <p className="mb-0 fs-4 fw-bold">{value}</p>
                </Card.Body>
            </Card>
        </Col>
    );

    const ChartCard = ({title, children}: { title: string; children: React.ReactNode }) => (
        <Card className="h-100 shadow">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{title}</h5>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center p-4">
                {children}
            </Card.Body>
        </Card>
    );

    return (
        <>
            <div className="bg-dark">
                <NavBar title="Admin / Dashboard"/>
            </div>

            <Container fluid className="p-5">
                <Row className="mb-2">
                    <Col>
                        <h1 className="text-primary mb-2">
                            {data.project.name}: {data.project.internalId} - {data.progress.avgProgress.toFixed(2)}%
                        </h1>
                        <h4 className="text-secondary">{data.project.client}</h4>
                    </Col>
                </Row>
                <Row className="g-4 mb-4">
                    <StatCard
                        title="Pipe Length Range"
                        value={`${data.pipeLengths.min} - ${data.pipeLengths.max} mm`}
                    />
                    <StatCard
                        title="Fitting Types Modes"
                        value={data.fittingTypes.modes?.join(', ') || 'N/A'}
                    />
                    <StatCard
                        title="Median Pipe Length"
                        value={`${data.pipeLengths.median.toFixed(2)} mm`}
                    />
                    <StatCard
                        title="Thickness Std. Deviation"
                        value={`${data.pipeLengths.thicknessStandardDeviation.toFixed(2)} mm`}
                    />
                </Row>
                <Row className="g-4 mb-4">
                    <Col md={6}>
                        <ChartCard title="Project Progress">
                            <ReactECharts option={chartOptions.pie} style={{height: 350, width: '100%'}}/>
                        </ChartCard>
                    </Col>
                    <Col md={6}>
                        <ChartCard title="Boxplot - Pipe Thickness">
                            <ReactECharts option={chartOptions.boxplot} style={{height: 350, width: '100%'}}/>
                        </ChartCard>
                    </Col>
                </Row>
                <Row className="g-4 mb-4">
                    <Col md={6}>
                        <ChartCard title="Frequency Table - Pipe Nominal Diameter">
                            <div className="w-100 overflow-auto">
                                <Table striped hover className="mb-0">
                                    <thead className="table-dark">
                                    <tr>
                                        <th>Diameter (mm)</th>
                                        <th>Diameter (pol)</th>
                                        <th>Freq. Absolute</th>
                                        <th>Freq. Relative (%)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedFrequencies.map((freq) => (
                                        <tr key={freq.nominalDiameterMm}>
                                            <td>{freq.nominalDiameterMm.toFixed(0)}</td>
                                            <td>{freq.nominalDiameterInch.toFixed(2)}</td>
                                            <td>{freq.absoluteFrequency}</td>
                                            <td>{(freq.relativeFrequency * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        </ChartCard>
                    </Col>
                    <Col md={6}>
                        <ChartCard title="Bar Chart - Fitting Types">
                            <ReactECharts option={chartOptions.barChart} style={{height: 350, width: '100%'}}/>
                        </ChartCard>
                    </Col>
                </Row>
                <Row className="g-4">
                    <Col>
                        <ChartCard title="Histogram - Pipe Lengths">
                            <ReactECharts option={chartOptions.histogram} style={{height: 400, width: '100%'}}/>
                        </ChartCard>
                    </Col>
                </Row>
            </Container>
        </>
    );
}