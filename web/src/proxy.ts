import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./routes";
import { hasRole, validateSession } from "@/lib/api/auth";

export const config = {
  matcher: ["/", "/login", "/roles", "/cut", "/assembly", "/weld"],
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

  await validateSession(token)
    .then((res) => {
      if (!res.valid)
        return NextResponse.redirect(new URL(ROUTES.login, req.url));
    })
    .catch(() => {
      return NextResponse.redirect(new URL(ROUTES.login, req.url));
    });

  const pageRolesMap: Record<string, string> = {
    [ROUTES.cut]: "cutting-operator",
    [ROUTES.assembly]: "pipe-fitter",
    [ROUTES.weld]: "welder",
  };

  const requiredRole = pageRolesMap[pathname];
  if (requiredRole) {
    await hasRole(requiredRole, token)
      .then((res) => {
        if (!res.hasRole)
          return NextResponse.redirect(new URL(ROUTES.unauthorized, req.url));
      });
  }

  return NextResponse.next();
}
