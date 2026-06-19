import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./routes";
import { getMe } from "@/lib/api/auth";

export const config = {
  matcher: ["/", "/login", "/roles", "/cut", "/assembly", "/weld"],
};

// Cada estágio exige o seu papel; administradores acessam todos.
const pageRolesMap: Record<string, string> = {
  [ROUTES.cut]: "cutting-operator",
  [ROUTES.assembly]: "pipe-fitter",
  [ROUTES.weld]: "welder",
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const isLoginPage = pathname === ROUTES.login;

  if (isLoginPage) {
    return token
      ? NextResponse.redirect(new URL(ROUTES.roles, req.url))
      : NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.login, req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(ROUTES.roles, req.url));
  }

  // Valida a sessão e obtém os papéis numa única chamada a /auth/me.
  let roles: string[];
  try {
    const user = await getMe(token);
    roles = (user.roles ?? []).map((role) => role.name);
  } catch {
    return NextResponse.redirect(new URL(ROUTES.login, req.url));
  }

  const requiredRole = pageRolesMap[pathname];
  if (
    requiredRole &&
    !roles.includes(requiredRole) &&
    !roles.includes("administrator")
  ) {
    return NextResponse.redirect(new URL(ROUTES.unauthorized, req.url));
  }

  return NextResponse.next();
}
