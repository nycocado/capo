import {Button, Card, CardBody, Col, Row, Table} from "react-bootstrap";

function WorkTable({activeTab, setActiveTab, allItems, workingItems, handleRowClick}: {
    activeTab: string;
    setActiveTab: (value: string) => void;
    allItems: any[];
    workingItems: any[];
    handleRowClick: (item: any) => void;
}) {
    return (
        <div className="d-flex flex-column h-100">
            <Row className="g-3 mb-3">
                <Col>
                    <Button
                        variant={activeTab === 'all' ? 'primary' : 'outline-primary'}
                        className="w-100"
                        onClick={() => setActiveTab('all')}
                    >
                        ALL
                    </Button>
                </Col>
                <Col className="text-end">
                    <Button
                        variant={activeTab === 'working' ? 'primary' : 'outline-primary'}
                        className="w-100"
                        onClick={() => setActiveTab('working')}
                    >
                        WORKING
                    </Button>
                </Col>
            </Row>
            <Card text="light" className="rounded-3 bg-dark flex-grow-1 d-flex flex-column">
                <CardBody className="d-flex flex-column">
                    <div table-responsive flex-grow-1 style={{maxHeight: '550px', overflowY: 'auto'}}>
                        <Table borderless hover responsive size="auto" variant="dark" className="mb-0 flex-grow-1">
                            <thead>
                            <tr>
                                <th className="text-center border-bottom border-light py-3">ID</th>
                                <th className="text-center border-bottom border-light py-3">Isométrico</th>
                                <th className="text-center border-bottom border-light py-3">Folha</th>
                                <th className="text-center border-bottom border-light py-3">Troço</th>
                                <th className="text-center border-bottom border-light py-3">Dimensão</th>
                                <th className="text-center border-bottom border-light py-3">Ø</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(activeTab === 'all' ? allItems : workingItems).map(item => (
                                <tr key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer">
                                    <td className="text-center py-3">PL{item.id}</td>
                                    <td className="text-center py-3">{item.isometric}</td>
                                    <td className="text-center py-3">{item.sheet}</td>
                                    <td className="text-center py-3">{item.section}</td>
                                    <td className="text-center py-3">{item.dimension}</td>
                                    <td className="text-center py-3">{item.diameter}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default WorkTable;
