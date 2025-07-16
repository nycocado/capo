import React from "react";

export interface TaggedValueConfig {
  type: "tagged";
  label: string;
  value: string | number;
  tag: string;
  onClick?: () => void;
}

export interface TaggedValueProps {
  label: string;
  value?: string | number | null;
  tag: string | null;
}

export function TaggedValue({ label, value, tag }: TaggedValueProps) {
  const displayTag = value != "\u00A0" && tag ? tag : "";
  return (
    <>
      <h5 className="opacity-75">{label}</h5>
      <h2>
        {value}
        <small className="ms-2 fs-5">{displayTag}</small>
      </h2>
    </>
  );
}
