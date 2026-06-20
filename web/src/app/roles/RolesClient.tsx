"use client";

import { Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import type { Station } from "./page";
import NavBar from "@components/layout/NavBar/NavBar";
import StationCard from "./StationCard";

interface RolesClientProps {
  stations: Station[];
  error?: string;
}

export default function RolesClient({ stations, error }: RolesClientProps) {
  const router = useRouter();

  if (error) {
    return (
      <div className="line">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <>
      <NavBar title="Stations" fixed={true} />
      <div className="line">
        <header className="line__head">
          <p className="line__eyebrow">Production line</p>
          <h1 className="line__title">Choose your station</h1>
          <p className="line__sub">The pipe runs cut → assembly → weld</p>
        </header>

        <div className="line__track">
          <span className="line__pipe" aria-hidden="true" />
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onSelect={() => station.route && router.push(station.route)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
