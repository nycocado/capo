import { NextResponse } from "next/server";
import { ROUTES } from "@/routes";

export function GET() {
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: ROUTES.login },
  });
  response.cookies.set("token", "", { path: "/", maxAge: 0 });
  return response;
}
