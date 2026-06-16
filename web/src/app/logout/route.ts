import { NextResponse } from "next/server";
import { ROUTES } from "@/routes";

/**
 * Encerra a sessão: expira o cookie httpOnly `token` (que o JS do cliente não
 * consegue remover) e redireciona para o login. Feito no servidor por ser a
 * única forma de apagar um cookie httpOnly.
 *
 * O redirect usa um `Location` relativo de propósito: atrás do NGINX o host
 * absoluto do servidor é o interno do container (ex.: 0.0.0.0:3000), inacessível
 * pelo browser; o caminho relativo é resolvido contra a origem pública.
 */
export function GET() {
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: ROUTES.login },
  });
  response.cookies.set("token", "", { path: "/", maxAge: 0 });
  return response;
}
