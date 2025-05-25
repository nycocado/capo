"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Card, Table, Spinner} from 'react-bootstrap';
import dynamic from 'next/dynamic';
import {useCookies} from 'react-cookie';

const ReactECharts = dynamic(() => import('echarts-for-react'), {ssr: false});

interface StatisticsData {
    progress: {
        avgProgress: number;
    };
    pipeLengths: {
        min: number;
        max: number;
        median: number;
        thicknessStandardDeviation: number;
    };
    fittingTypes: {
        modes: string[];
    };
    diameterFrequencies: {
        frequencies: {
            nominalDiameterMm: number;
            nominalDiameterInch: number;
            absoluteFrequency: number;
            relativeFrequency: number;
        }[];
    };
    chartData: {
        histogram: {
            bins: number[];
            counts: number[];
        };
        boxPlot: {
            min: number;
            q1: number;
            median: number;
            q3: number;
            max: number;
        };
        barChart: {
            labels: string[];
            values: number[];
        };
        pieChart: {
            segments: {
                label: string;
                value: number;
            }[];
        };
    };
}

export default function DashboardPage() {
    const [cookies] = useCookies(['token']);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<StatisticsData | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('http://localhost:3002/statistic/overall/1', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookies.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }

                const statisticsData: StatisticsData = await response.json();
                setData(statisticsData);
            } catch (err: any) {
                console.error('Erro ao buscar dados estatísticos:', err);
                setError(err.message || 'Ocorreu um erro ao buscar os dados estatísticos.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [cookies.token]); // Re-executar se o token mudar

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner>
                    <p className="mt-3">Carregando dados estatísticos...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="py-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Erro!</h4>
                    <p>{error}</p>
                </div>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container fluid className="py-4">
                <div className="alert alert-warning" role="alert">
                    Nenhum dado estatístico disponível.
                </div>
            </Container>
        );
    }

    // Preparar dados para os gráficos
    const pieData = [
        {name: 'Concluído', value: data.progress.avgProgress},
        {name: 'A fazer', value: 100 - data.progress.avgProgress}
    ];

    // Configurações dos gráficos
    const histOpt = {
        title: {text: 'Histograma de Comprimentos'},
        xAxis: {
            type: 'category',
            data: data.chartData.histogram.bins.map((bin, i, arr) =>
                i < arr.length - 1 ?
                    `${bin.toFixed(0)}-${arr[i + 1].toFixed(0)}` :
                    bin.toFixed(0)
            )
        },
        yAxis: {type: 'value'},
        series: [{type: 'bar', data: data.chartData.histogram.counts}]
    };

    const boxOpt = {
        title: {text: 'Box-plot de Espessura'},
        xAxis: {type: 'category', data: ['Espessura']},
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
        title: {text: 'Frequência de Acessórios'},
        xAxis: {type: 'category', data: data.chartData.barChart.labels},
        yAxis: {type: 'value'},
        series: [{type: 'bar', data: data.chartData.barChart.values}]
    };

    const pieOpt = {
        title: {text: 'Progresso do Projeto'},
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}%'
        },
        series: [{
            name: 'Progresso',
            type: 'pie',
            radius: '50%',
            avoidLabelOverlap: false,
            label: {
                show: true,
                formatter: '{b}: {d}%'
            },
            data: pieData,
        }]
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="p-3">
                        <h6>Média de Progresso</h6>
                        <p>{data.progress.avgProgress.toFixed(2)}%</p>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3">
                        <h6>Amplitude de Comprimento</h6>
                        <p>{data.pipeLengths.min} - {data.pipeLengths.max}</p>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3">
                        <h6>Mediana de Comprimento</h6>
                        <p>{data.pipeLengths.median.toFixed(2)}</p>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3">
                        <h6>Desvio Padrão de Espessura</h6>
                        <p>{data.pipeLengths.thicknessStandardDeviation.toFixed(2)}</p>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3">
                        <h6>Moda de Acessório</h6>
                        <p>{data.fittingTypes.modes[0] || 'N/A'}</p>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col>
                    <h5>Tabela de Frequências - Diâmetros</h5>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Diâmetro (mm)</th>
                            <th>Diâmetro (pol)</th>
                            <th>Freq. Absoluta</th>
                            <th>Freq. Relativa (%)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.diameterFrequencies.frequencies.map((freq) => (
                            <tr key={freq.nominalDiameterMm}>
                                <td>{freq.nominalDiameterMm.toFixed(2)}</td>
                                <td>{freq.nominalDiameterInch.toFixed(2)}"</td>
                                <td>{freq.absoluteFrequency}</td>
                                <td>{(freq.relativeFrequency * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}><ReactECharts option={histOpt} style={{height: 300}}/></Col>
                <Col md={6}><ReactECharts option={boxOpt} style={{height: 300}}/></Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}><ReactECharts option={barOpt} style={{height: 300}}/></Col>
                <Col md={6}><ReactECharts option={pieOpt} style={{height: 300}}/></Col>
            </Row>
        </Container>
    );
}

