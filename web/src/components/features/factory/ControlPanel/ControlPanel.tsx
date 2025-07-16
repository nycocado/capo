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
import { ControlPanelProps } from "@components/features/factory/ControlPanel/ControlPanel.types";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import {
  getSearchFields,
  getSearchFieldLabel,
} from "./ControlPanel.searchConfig";

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
    <Card bg="dark">
      <CardBody className="pb-2">
        <InputGroup className="mb-3">
          <DropdownButton
            variant="light"
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
            className="bg-light"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroup.Text>
            <MagnifyingGlassIcon
              className="text-primary"
              style={{ height: "23px" }}
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
