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

async function canAccessRole(url: string, token: string): Promise<boolean> {
    try {
        const res = await fetch(
            `${API_URL}${url}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
        );
        if (!res.ok) throw new Error();
        return res.ok;
    } catch {
        return false;
    }
}

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

    const pageRolesMap: Record<string, string> = {
        [ROUTES.cut]: API_ROUTES.cuttingOperator.verify,
        [ROUTES.assembly]: API_ROUTES.pipeFitter.verify,
        [ROUTES.weld]: API_ROUTES.welder.verify,
        [ROUTES.admin]: API_ROUTES.admin.verify
    }

    if (pathname in pageRolesMap) {
        const canAccess = await canAccessRole(pageRolesMap[pathname], token);
        if (!canAccess) {
            return NextResponse.redirect(new URL(ROUTES.unauthorized, req.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}