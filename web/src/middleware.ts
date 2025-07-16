import { NextRequest, NextResponse } from "next/server";
import { API_ROUTES, ROUTES } from "./routes";
import ky from "ky";
import { HasRoleDto, RoleDto, ValidateResDto } from "@/dtos";

export const config = {
  matcher: ["/", "/login", "/roles", "/cut", "/assembly", "/weld"],
};

export async function middleware(req: NextRequest) {
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

  await ky
    .get<ValidateResDto>(API_ROUTES.auth.validate, {
      headers: {
        Cookie: `token=${token}`,
      },
    })
    .json()
    .then((res) => {
      if (!res.valid)
        return NextResponse.redirect(new URL(ROUTES.login, req.url));
    });

  const pageRolesMap: Record<string, string> = {
    [ROUTES.cut]: "cutting-operator",
    [ROUTES.assembly]: "pipe-fitter",
    [ROUTES.weld]: "welder",
  };

  if (pathname in pageRolesMap) {
    await ky
      .get<HasRoleDto>(API_ROUTES.auth.hasRole(pageRolesMap[pathname]), {
        headers: {
          Cookie: `token=${token}`,
        },
      })
      .json()
      .then((res) => {
        if (!res.hasRole)
          return NextResponse.redirect(new URL(ROUTES.unauthorized, req.url));
      });
  }

  return NextResponse.next();
}
