import { browserApi, serverApi } from "./client";

interface ListRoutes {
  base: string;
  id: (id: number) => string;
  pendingCount: string;
  claim: (id: number) => string;
}

export function makeListApi<T>(routes: ListRoutes) {
  return {
    getList: (token: string | undefined) =>
      serverApi(token).get(routes.base).json<T[]>(),
    fetchList: () => browserApi.get(routes.base).json<T[]>(),
    getById: (id: number) => browserApi.get(routes.id(id)).json<T>(),
    getPendingCount: (token: string | undefined) =>
      serverApi(token).get(routes.pendingCount).json<{ count: number }>(),
    fetchPendingCount: () =>
      browserApi.get(routes.pendingCount).json<{ count: number }>(),
    claim: (id: number) => browserApi.post(routes.claim(id)).json<T>(),
    release: (id: number) => browserApi.delete(routes.claim(id)).json<T>(),
  };
}
