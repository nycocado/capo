import { cookies } from "next/headers";
import RolesClient from "@/app/roles/RolesClient";
import { ROUTES } from "@/routes";
import { getMyRoles } from "@/lib/api";

export interface Role {
  id: string;
  title: string;
  route?: string;
}

const fixedRoles: Role[] = [
  { id: "cutting-operator", title: "Cutting Operator", route: ROUTES.cut },
  { id: "pipe-fitter", title: "Pipe Fitter", route: ROUTES.assembly },
  { id: "welder", title: "Welder", route: ROUTES.weld },
];

export default async function RolesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await getMyRoles(token);

    const mappedRoles = fixedRoles.filter((role) =>
      res.some((userRole) => userRole.name === role.id),
    );

    return <RolesClient roles={mappedRoles} />;
  } catch {
    return (
      <RolesClient roles={[]} error="Failed to load roles. Please try again." />
    );
  }
}
