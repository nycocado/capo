import {NextRequest, NextResponse} from "next/server";
import {API_ROUTES, ROUTES} from "./routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const config = {
    matcher: [
        "/",
        "/login",
        "/roles",
        "/cut",
        "/assembly",
        "/weld",
        "/admin/:path*"
    ]
};

export async function middleware(req: NextRequest) {
    const {pathname} = req.nextUrl;
    const token = req.cookies.get("token")?.value;
    const isLoginPage = pathname === ROUTES.login;

    if (isLoginPage) {
        if (token) {
            return NextResponse.redirect(new URL(ROUTES.roles, req.url));
        }
        return NextResponse.next();
    }

    if (pathname === "/") {
        if (!token) {
            return NextResponse.redirect(new URL(ROUTES.login, req.url));
        }
        return NextResponse.redirect(new URL(ROUTES.roles, req.url));
    }

    if (!token) {
        return NextResponse.redirect(new URL(ROUTES.login, req.url));
    }

    try {
        const res = await fetch(
            `${API_URL}${API_ROUTES.auth.validate}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (!res.ok) throw new Error();
    } catch {
        return NextResponse.redirect(new URL(ROUTES.login, req.url));
    }

    return NextResponse.next();
}