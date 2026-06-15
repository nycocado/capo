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

/**
 * Landing pós-login: a linha de produção. O operador toca na estação que está
 * certificado a operar; o tubo atravessa as três no sentido do fluxo.
 */
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
          <span className="line__pipe-arrow" aria-hidden="true" />
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
