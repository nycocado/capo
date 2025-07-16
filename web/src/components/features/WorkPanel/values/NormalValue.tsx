import React from "react";

export interface NormalValueConfig {
  type: "normal";
  label: string;
  value: string | number;
  onClick?: () => void;
}

export interface NormalValueProps {
  label: string;
  value?: string | number;
}

export function NormalValue({ label, value }: NormalValueProps) {
  return (
    <>
      <h5 className="opacity-75">{label}</h5>
      <h2>{value}</h2>
    </>
  );
}
