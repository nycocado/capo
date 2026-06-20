import ky, { HTTPError, type KyInstance } from "ky";

export const SESSION_EXPIRED_MESSAGE = "Session expired. Please login again.";

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

export const publicApi: KyInstance = ky.create({ credentials: "include" });

export function serverApi(token: string | undefined): KyInstance {
  return ky.create({
    headers: token ? { Cookie: `token=${token}` } : undefined,
  });
}
