import React from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  InputGroup,
  Row,
  FormControl,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import {
  getSearchFields,
  getSearchFieldLabel,
  tabSearchFieldMapping,
} from "./ControlPanel.searchConfig";
import { TabType } from "@components/features/WorkTabs";

export interface ControlButtonConfig {
  variant: string;
  label: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ControlPanelProps {
  search: string;
  setSearch: (value: string) => void;
  buttons: ControlButtonConfig[];
  searchField: string;
  setSearchField: (value: string) => void;
  activeTab: TabType;
  context: keyof typeof tabSearchFieldMapping;
}

export function ControlPanel({
  search,
  setSearch,
  buttons,
  searchField,
  setSearchField,
  activeTab,
  context,
}: ControlPanelProps) {
  const searchFields = getSearchFields(context, activeTab);
  const currentFieldLabel = getSearchFieldLabel(
    context,
    activeTab,
    searchField,
  );

  return (
    <Card className="op-panel">
      <CardBody className="pb-2">
        <InputGroup className="mb-3 op-search">
          <DropdownButton
            variant="secondary"
            title={currentFieldLabel || "Field"}
            id="search-field"
          >
            {searchFields.map((field) => (
              <Dropdown.Item
                key={field.id}
                onClick={() => setSearchField(field.id)}
                active={searchField === field.id}
              >
                {field.label}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <FormControl
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroup.Text>
            <MagnifyingGlassIcon
              style={{ height: "23px", color: "var(--steel)" }}
            />
          </InputGroup.Text>
        </InputGroup>
        <Row className="g-3">
          {buttons.map((btn, idx) => (
            <Col key={idx} className="d-flex flex-column">
              <Button
                variant={btn.variant}
                className={`fs-5 ${btn.className || ""}`}
                style={{ minHeight: "50px", ...btn.style }}
                onClick={btn.onClick}
              >
                {btn.label}
              </Button>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
}
