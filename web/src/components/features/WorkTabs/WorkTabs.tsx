import { Button, Col, Row } from "react-bootstrap";

export interface WorkTabsProps {
  tabs: readonly string[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export function WorkTabs(props: WorkTabsProps) {
  const { tabs, activeTab, setActiveTab } = props;

  return (
    <>
      <Row className="g-3">
        {tabs.map((tab) => (
          <Col key={tab} className={tab === "working" ? "text-end" : ""}>
            <Button
              variant={activeTab === tab ? "primary" : "dark"}
              className={`w-100 fw-bold fs-5 ${activeTab === tab ? "text-black" : "text-primary"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          </Col>
        ))}
      </Row>
    </>
  );
}
