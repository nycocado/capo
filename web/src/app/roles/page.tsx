import { cookies } from "next/headers";
import RolesClient from "@/app/roles/RolesClient";
import { ROUTES } from "@/routes";
import {
  getAssemblyListsPendingCount,
  getCutListsPendingCount,
  getMe,
  getWeldListsPendingCount,
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
  /** Ordens por concluir; `null` quando bloqueada ou a busca falhou. */
  pendingCount: number | null;
}

/**
 * Estações na ordem real do fluxo do tubo (corte → montagem → solda), cada uma
 * com o fetcher de contagem pendente da sua etapa.
 */
const STATIONS = [
  {
    id: "cutting-operator",
    order: 1,
    name: "Cutting",
    description: "Mark pipe lengths and log heat numbers.",
    route: ROUTES.cut,
    fetchPendingCount: getCutListsPendingCount,
  },
  {
    id: "pipe-fitter",
    order: 2,
    name: "Assembly",
    description: "Fit spools and verify materials.",
    route: ROUTES.assembly,
    fetchPendingCount: getAssemblyListsPendingCount,
  },
  {
    id: "welder",
    order: 3,
    name: "Welding",
    description: "Weld joints and record WPS data.",
    route: ROUTES.weld,
    fetchPendingCount: getWeldListsPendingCount,
  },
] as const;

export default async function RolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let stations: Station[];
  try {
    const user = await getMe(token);
    const accessibleIds = new Set((user.roles ?? []).map((role) => role.name));

    // A contagem só é buscada nas estações certificadas (as demais ficam
    // bloqueadas, sem acesso ao endpoint); falha numa etapa não derruba a página.
    stations = await Promise.all(
      STATIONS.map(async ({ fetchPendingCount, ...station }) => {
        const accessible = accessibleIds.has(station.id);
        let pendingCount: number | null = null;
        if (accessible) {
          try {
            const result = await fetchPendingCount(token);
            pendingCount = result.count;
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
