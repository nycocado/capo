"use client";

import { LockClosedIcon } from "@heroicons/react/16/solid";
import { useQuery } from "@tanstack/react-query";
import { useStageSocket } from "@/lib/ws/useStageSocket";
import { WS_EVENTS, WS_ROUTES } from "@/routes";
import {
  fetchAssemblyListsPendingCount,
  fetchCutListsPendingCount,
  fetchWeldListsPendingCount,
} from "@/lib/api";
import type { Station } from "./page";

const STAGE_LIVE: Record<
  Station["id"],
  { route: string; fetch: () => Promise<{ count: number }> }
> = {
  "cutting-operator": {
    route: WS_ROUTES.cutList,
    fetch: fetchCutListsPendingCount,
  },
  "pipe-fitter": {
    route: WS_ROUTES.assemblyList,
    fetch: fetchAssemblyListsPendingCount,
  },
  welder: { route: WS_ROUTES.weldList, fetch: fetchWeldListsPendingCount },
};

function useLivePendingCount(station: Station): number | null {
  const live = STAGE_LIVE[station.id];
  const queryKey = ["pending-count", station.id];
  const { data } = useQuery({
    queryKey,
    queryFn: async () => (await live.fetch()).count,
    enabled: station.accessible,
    initialData: station.accessible
      ? (station.pendingCount ?? undefined)
      : undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  useStageSocket({
    route: live.route,
    queryKey,
    eventNames: [WS_EVENTS.stage.claimChanged, WS_EVENTS.stage.statusChanged],
    enabled: station.accessible,
  });
  return station.accessible ? (data ?? null) : station.pendingCount;
}

interface StationCardProps {
  station: Station;
  onSelect: () => void;
}

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

function StationGauge({ station }: { station: Station }) {
  const pendingCount = useLivePendingCount(station);

  if (!station.accessible) {
    return (
      <span className="station__locked-tag">
        <LockClosedIcon />
        Certification required
      </span>
    );
  }

  if (pendingCount === null) {
    return <span className="station__clear">—</span>;
  }

  if (pendingCount === 0) {
    return <span className="station__clear">All clear</span>;
  }

  return (
    <>
      <span className="station__count">{pendingCount}</span>
      <span className="station__count-label">
        {pendingCount === 1 ? "list waiting" : "lists waiting"}
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
