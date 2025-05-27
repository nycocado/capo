'use client';

import React from 'react';
import {Container, Row, Col, Card, Table} from 'react-bootstrap';
import dynamic from 'next/dynamic';
import {StatisticsData} from '@models/statistics/statistics-data.interface';

const ReactECharts = dynamic(() => import('echarts-for-react'), {ssr: false});

export default function DashboardClient({data}: { data: StatisticsData }) {
    const pieData = [
        {name: 'Finished', value: data.progress.avgProgress},
        {name: 'To Do', value: 100 - data.progress.avgProgress}
    ];

    const counts = data.chartData.histogram.counts;
    const min = data.pipeLengths.min;
    const max = data.pipeLengths.max;
    const binCount = counts.length;
    const step = (max - min) / binCount;
    const labels = counts.map((_, i) => {
        const startBin = min + i * step;
        const endBin = min + (i + 1) * step;
        const startLabel = Math.floor(startBin);
        const endLabel = i === binCount - 1 ? Math.ceil(max) : Math.floor(endBin);
        return `${startLabel}-${endLabel}`;
    });

    const histOpt = {
        xAxis: {type: 'category', data: labels},
        yAxis: {type: 'value'},
        series: [{type: 'bar', data: counts}]
    };

    const boxOpt = {
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
    };

    const barOpt = {
        xAxis: {type: 'category', data: data.chartData.barChart.labels},
        yAxis: {type: 'value'},
        series: [{type: 'bar', data: data.chartData.barChart.values}]
    };

    const pieOpt = {
        tooltip: {trigger: 'item', formatter: '{a} <br/>{b}: {c}%'},
        series: [{
            name: 'Progress',
            type: 'pie',
            radius: '50%',
            label: {show: true, formatter: '{b}: {d}%'},
            data: pieData
        }]
    };

    const sortedFrequencies = [...data.diameterFrequencies.frequencies].sort(
        (a, b) => a.nominalDiameterMm - b.nominalDiameterMm
    );

    return (
        <Container fluid className="py-4 px-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="text-primary">
                        {data.project.name}: {data.project.internalId} - {data.progress.avgProgress.toFixed(2)}%
                    </h1>
                    <h3 className="text-primary">{data.project.client}</h3>
                </Col>
            </Row>

            <Card className="bg-primary p-4 w-100 rounded-3">
                <Card.Body>
                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body className="d-flex flex-column">
                                    <h2 className="mb-4 text-center">Project Progress</h2>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ReactECharts option={pieOpt} style={{height: 350, width: '100%'}}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body>
                                    <h2 className="mb-4 text-center">Project Statistics</h2>

                                    <Row className="g-3 mb-3">
                                        <Col md={6}>
                                            <Card className="bg-secondary text-white h-100 rounded-3">
                                                <Card.Body className="d-flex flex-column align-items-center">
                                                    <h5 className="mb-3">Pipe Length Range</h5>
                                                    <p className="mb-0 fs-5">{data.pipeLengths.min} mm
                                                        - {data.pipeLengths.max} mm</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="bg-secondary text-white h-100 rounded-3">
                                                <Card.Body className="d-flex flex-column align-items-center">
                                                    <h5 className="mb-3">Fitting Types Modes</h5>
                                                    <p className="mb-0 fs-5">{data.fittingTypes.modes?.length ? data.fittingTypes.modes.join(', ') : 'N/A'}</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Card className="bg-secondary text-white h-100 rounded-3">
                                                <Card.Body className="d-flex flex-column align-items-center">
                                                    <h5 className="mb-3">Median Pipe Length</h5>
                                                    <p className="mb-0 fs-5">{data.pipeLengths.median.toFixed(2)} mm</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="bg-secondary text-white h-100 rounded-3">
                                                <Card.Body className="d-flex flex-column align-items-center">
                                                    <h5 className="mb-3">Thickness Standard Deviation</h5>
                                                    <p className="mb-0 fs-5">{data.pipeLengths.thicknessStandardDeviation.toFixed(2)} mm</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body>
                                    <h2 className="mb-4 text-center">Frequency Table - Pipe Nominal Diameter</h2>
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead>
                                            <tr>
                                                <th>Diameter (mm)</th>
                                                <th>Diameter (pol)</th>
                                                <th>Freq. Absolute</th>
                                                <th>Freq. Relative (%)</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {sortedFrequencies.map((f) => (
                                                <tr key={f.nominalDiameterMm}>
                                                    <td>{f.nominalDiameterMm.toFixed(0)}</td>
                                                    <td>{f.nominalDiameterInch.toFixed(2)}</td>
                                                    <td>{f.absoluteFrequency}</td>
                                                    <td>{(f.relativeFrequency * 100).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body className="d-flex flex-column">
                                    <h2 className="mb-4 text-center">Boxplot - Pipe Thickness</h2>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ReactECharts option={boxOpt} style={{height: 400, width: '100%'}}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="g-4">
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body className="d-flex flex-column">
                                    <h2 className="mb-4 text-center">Histogram - Pipe Lengths</h2>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ReactECharts option={histOpt} style={{height: 400, width: '100%'}}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Body className="d-flex flex-column">
                                    <h2 className="mb-4 text-center">Bar Chart - Fitting Types</h2>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <ReactECharts option={barOpt} style={{height: 400, width: '100%'}}/>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
