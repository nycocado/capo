'use client';

import React from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { StatisticsData } from '@models/statistics/statistics-data.interface';
import NavBarNotFixed from "@/components/layout/NavBar/NavBarNotFixed";

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function DashboardClient({ data }: { data: StatisticsData }) {
    const pieData = [
        { name: 'Finished', value: data.progress.avgProgress },
        { name: 'To Do', value: 100 - data.progress.avgProgress }
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
        xAxis: { type: 'category', data: labels },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: counts }]
    };

    const boxOpt = {
        xAxis: { type: 'category', data: ['Thickness'] },
        yAxis: { type: 'value' },
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
        xAxis: { type: 'category', data: data.chartData.barChart.labels },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: data.chartData.barChart.values }]
    };

    const pieOpt = {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c}%' },
        series: [{
            name: 'Progress',
            type: 'pie',
            radius: '50%',
            label: { show: true, formatter: '{b}: {d}%' },
            data: pieData
        }]
    };

    const sortedFrequencies = [...data.diameterFrequencies.frequencies].sort(
        (a, b) => a.nominalDiameterMm - b.nominalDiameterMm
    );

    return (
        <>
            <div className="bg-black">
                <NavBarNotFixed title="Admin / DashBoard" />
            </div>
            <div className="bg-secondary">
                <NavBarNotFixed title="Admin / DashBoard" />
            </div>
            <div className="d-flex">
                <Container fluid className="px-5 pb-5 m-5">
                    <Row className="mb-5">
                        <Col>
                            <h1 className="text-primary">
                                {data.project.name}: {data.project.internalId} - {data.progress.avgProgress.toFixed(2)}%
                            </h1>
                            <h4 className="text-primary">{data.project.client}</h4>
                        </Col>
                    </Row>
                    <Row className="g-4 mb-4">
                        <Col md={3}>
                            <Card className="bg-white text-black h-100 rounded-3">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                                    <h6 className="mb-3 text-center">Pipe Length Range</h6>
                                    <p className="mb-0 fs-4">{data.pipeLengths.min} mm
                                        - {data.pipeLengths.max} mm</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="bg-white text-black h-100 rounded-3">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                                    <h6 className="mb-3 text-center">Fitting Types Modes</h6>
                                    <p className="mb-0 fs-4">{data.fittingTypes.modes?.length ? data.fittingTypes.modes.join(', ') : 'N/A'}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="bg-white text-black h-100 rounded-3">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                                    <h6 className="mb-3 text-center">Median Pipe Length</h6>
                                    <p className="mb-0 fs-4">{data.pipeLengths.median.toFixed(2)} mm</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="bg-white text-black h-100 rounded-3">
                                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                                    <h6 className="mb-3 text-center">Thickness Standard Deviation</h6>
                                    <p className="mb-0 fs-4">{data.pipeLengths.thicknessStandardDeviation.toFixed(2)} mm</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Header className="py-3 fs-4 bg-primary text-white">Project Progress</Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                        <ReactECharts option={pieOpt} style={{ height: 350, width: '100%' }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Header className="py-3 fs-4 bg-primary text-white">Boxplot - Pipe Thickness</Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                        <ReactECharts option={boxOpt} style={{ height: 400, width: '100%' }} />
                                    </div>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>
                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Header className="py-3 fs-4 bg-primary text-white">Frequency Table - Pipe Nominal Diameter</Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
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
                                <Card.Header className="py-3 fs-4 bg-primary text-white">Bar Chart - Fitting Types</Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                        <ReactECharts option={barOpt} style={{ height: 400, width: '100%' }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        <Col md={12}>
                            <Card className="h-100 shadow-sm rounded-3">
                                <Card.Header className="py-3 fs-4 bg-primary text-white">Histogram - Pipe Lengths</Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <h2 className="mb-4 text-center"></h2>
                                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                                        <ReactECharts option={histOpt} style={{ height: 400, width: '100%' }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}
