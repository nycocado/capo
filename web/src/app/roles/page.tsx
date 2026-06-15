import { cookies } from "next/headers";
import RolesClient from "@/app/roles/RolesClient";
import { ROUTES } from "@/routes";
import {
  getMyRoles,
  getToDoAssemblyLists,
  getToDoCutLists,
  getToDoWeldLists,
} from "@/lib/api";

/** Estação da linha de produção, na forma serializável passada ao client. */
export interface Station {
  id: "cutting-operator" | "pipe-fitter" | "welder";
  order: number;
  name: string;
  description: string;
  route: string;
  /** O usuário é certificado nesta estação. */
  accessible: boolean;
  /** Listas pendentes (to-do); `null` quando bloqueada ou a busca falhou. */
  pendingCount: number | null;
}

/**
 * Estações na ordem real do fluxo do tubo (corte → montagem → solda), cada uma
 * com o fetcher da contagem de listas pendentes da sua etapa.
 */
const STATIONS = [
  {
    id: "cutting-operator",
    order: 1,
    name: "Cutting",
    description: "Mark pipe lengths and log heat numbers.",
    route: ROUTES.cut,
    fetchPending: getToDoCutLists,
  },
  {
    id: "pipe-fitter",
    order: 2,
    name: "Assembly",
    description: "Fit spools and verify materials.",
    route: ROUTES.assembly,
    fetchPending: getToDoAssemblyLists,
  },
  {
    id: "welder",
    order: 3,
    name: "Welding",
    description: "Weld joints and record WPS data.",
    route: ROUTES.weld,
    fetchPending: getToDoWeldLists,
  },
] as const;

export default async function RolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let stations: Station[];
  try {
    const userRoles = await getMyRoles(token);
    const accessibleIds = new Set(userRoles.map((role) => role.name));

    // A contagem só é buscada nas estações certificadas (as demais ficam
    // bloqueadas, sem acesso ao endpoint); falha numa etapa não derruba a página.
    stations = await Promise.all(
      STATIONS.map(async ({ fetchPending, ...station }) => {
        const accessible = accessibleIds.has(station.id);
        let pendingCount: number | null = null;
        if (accessible) {
          try {
            pendingCount = (await fetchPending(token)).length;
          } catch {
            pendingCount = null;
          }
        }
        return { ...station, accessible, pendingCount };
      }),
    );
  } catch {
    return (
      <RolesClient
        stations={[]}
        error="Failed to load stations. Please try again."
      />
    );
  }

  return <RolesClient stations={stations} />;
}
