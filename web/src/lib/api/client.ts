import ky, { HTTPError, type KyInstance } from "ky";

/** Mensagem exibida quando a sessão expira (401 em chamada autenticada). */
export const SESSION_EXPIRED_MESSAGE = "Session expired. Please login again.";

// Cliente do browser para chamadas autenticadas: envia o cookie de sessão e
// traduz 401 para a mensagem de sessão expirada.
export const browserApi: KyInstance = ky.create({
  credentials: "include",
  hooks: {
    beforeError: [
      ({ error }) => {
        if (error instanceof HTTPError && error.response.status === 401) {
          error.message = SESSION_EXPIRED_MESSAGE;
        }
        return error;
      },
    ],
  },
});

// Cliente do browser para chamadas públicas (ex.: login): aqui um 401 significa
// credenciais inválidas, então não recebe o tratamento de sessão expirada.
export const publicApi: KyInstance = ky.create({ credentials: "include" });

/**
 * Cliente para uso no servidor (RSC/proxy): injeta o cookie de sessão a partir
 * do token, já que fora do browser não há envio automático de cookies.
 *
 * @param token Valor do cookie `token` da requisição atual.
 * @returns Instância do ky com o header Cookie configurado.
 */
export function serverApi(token: string | undefined): KyInstance {
  return ky.create({
    headers: token ? { Cookie: `token=${token}` } : undefined,
  });
}
