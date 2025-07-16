import React from "react";

export interface DoubleValueConfig {
  type: "double";
  label: string;
  primaryValue: string | number;
  primaryTag: string;
  secondaryValue: string | number;
  secondaryTag: string;
  onClick?: () => void;
}

export interface DoubleValueProps {
  label: string;
  primaryValue?: string | number | null;
  primaryTag: string | null;
  secondaryValue?: string | number | null;
  secondaryTag: string | null;
}

export function DoubleValue({
  label,
  primaryValue,
  primaryTag,
  secondaryValue,
  secondaryTag,
}: DoubleValueProps) {
  const displayPrimaryTag =
    primaryValue != "\u00A0" && primaryTag ? primaryTag : "";
  const displaySecondaryTag =
    secondaryValue != "\u00A0" && secondaryTag ? secondaryTag : "";
  return (
    <>
      <h5 className="opacity-75">{label}</h5>
      <div>
        <h2 className="me-2 d-inline">
          {primaryValue}
          <small className="ms-1 fs-6">{displayPrimaryTag}</small>
        </h2>
        <h2 className="d-inline ms-3">
          {secondaryValue}
          <small className="ms-1 fs-6">{displaySecondaryTag}</small>
        </h2>
      </div>
    </>
  );
}
