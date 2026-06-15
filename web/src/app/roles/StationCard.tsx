"use client";

import { LockClosedIcon } from "@heroicons/react/16/solid";
import type { Station } from "./page";

interface StationCardProps {
  station: Station;
  onSelect: () => void;
}

/**
 * Glifos das estações: todos partem da seção transversal/eixo do tubo, para
 * amarrar o ícone à assinatura da linha (corte, junção e cordão de solda).
 */
const STATION_GLYPHS: Record<Station["id"], React.ReactNode> = {
  "cutting-operator": (
    <>
      <circle cx="32" cy="32" r="15" />
      <line x1="17" y1="47" x2="47" y2="17" />
      <line
        x1="22"
        y1="52"
        x2="52"
        y2="22"
        strokeDasharray="3 5"
        opacity="0.55"
      />
    </>
  ),
  "pipe-fitter": (
    <>
      <path d="M8 32 H26" strokeWidth={6} />
      <path d="M38 32 H56" strokeWidth={6} />
      <line x1="32" y1="15" x2="32" y2="49" />
      <circle cx="32" cy="21" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="32" cy="43" r="1.8" fill="currentColor" stroke="none" />
    </>
  ),
  welder: (
    <>
      <path d="M8 41 H56" strokeWidth={6} />
      <polyline points="24,31 28,37 32,31 36,37 40,31" />
      <line x1="15" y1="14" x2="21" y2="20" />
      <line x1="26" y1="11" x2="29" y2="17" />
    </>
  ),
};

/** Medidor do rodapé: contagem ao vivo de listas pendentes ou estado bloqueado. */
function StationGauge({ station }: { station: Station }) {
  if (!station.accessible) {
    return (
      <span className="station__locked-tag">
        <LockClosedIcon />
        Certification required
      </span>
    );
  }

  if (station.pendingCount === null) {
    return <span className="station__clear">—</span>;
  }

  if (station.pendingCount === 0) {
    return <span className="station__clear">All clear</span>;
  }

  return (
    <>
      <span className="station__count">{station.pendingCount}</span>
      <span className="station__count-label">
        {station.pendingCount === 1 ? "list waiting" : "lists waiting"}
      </span>
    </>
  );
}

const Glyph = ({ id }: { id: Station["id"] }) => (
  <svg
    className="station__glyph"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {STATION_GLYPHS[id]}
  </svg>
);

/**
 * Placard de uma estação na linha de produção. Estações certificadas são
 * botões clicáveis; as demais aparecem bloqueadas (preservam a visão da linha).
 */
export default function StationCard({ station, onSelect }: StationCardProps) {
  const order = String(station.order).padStart(2, "0");

  const body = (
    <>
      <span className="station__order">Station {order}</span>
      <Glyph id={station.id} />
      <h2 className="station__name">{station.name}</h2>
      <p className="station__desc">{station.description}</p>
      <div className="station__gauge">
        <StationGauge station={station} />
      </div>
    </>
  );

  if (!station.accessible) {
    return (
      <div className="station station--locked" aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="station station--active"
      onClick={onSelect}
    >
      {body}
    </button>
  );
}
