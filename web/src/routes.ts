const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL!
    : process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export const ROUTES = {
  home: "/",
  login: "/login",
  logout: "/logout",
  roles: "/roles",
  cut: "/cut",
  assembly: "/assembly",
  weld: "/weld",
  unauthorized: "/unauthorized",
};

export const API_ROUTES = {
  auth: {
    login: `${API_URL}/auth/login`,
    logout: `${API_URL}/auth/logout`,
    me: `${API_URL}/auth/me`,
  },
  pipeLengths: {
    statusEvents: (id: number) => `${API_URL}/pipe-lengths/${id}/status-events`,
  },
  joints: {
    statusEvents: (id: number) => `${API_URL}/joints/${id}/status-events`,
  },
  welds: {
    statusEvents: (id: number) => `${API_URL}/welds/${id}/status-events`,
  },
  cutLists: {
    base: `${API_URL}/cut-lists`,
    id: (id: number) => `${API_URL}/cut-lists/${id}`,
    claim: (id: number) => `${API_URL}/cut-lists/${id}/claim`,
    pendingCount: `${API_URL}/cut-lists/pending-count`,
  },
  assemblyLists: {
    base: `${API_URL}/assembly-lists`,
    id: (id: number) => `${API_URL}/assembly-lists/${id}`,
    claim: (id: number) => `${API_URL}/assembly-lists/${id}/claim`,
    pendingCount: `${API_URL}/assembly-lists/pending-count`,
  },
  weldLists: {
    base: `${API_URL}/weld-lists`,
    id: (id: number) => `${API_URL}/weld-lists/${id}`,
    claim: (id: number) => `${API_URL}/weld-lists/${id}/claim`,
    pendingCount: `${API_URL}/weld-lists/pending-count`,
  },
  fillerMaterials: {
    base: `${API_URL}/filler-materials`,
  },
  wps: {
    base: `${API_URL}/wps`,
  },
  documents: {
    download: (section: string, filename: string) =>
      `${API_URL}/documents/${section}/${filename}`,
  },
};

export const WS_ROUTES = {
  cutList: `${WS_URL}/cut-list`,
  assemblyList: `${WS_URL}/assembly-list`,
  weldList: `${WS_URL}/weld-list`,
};

export const WS_EVENTS = {
  default: {
    connect_error: "connect_error",
  },
  stage: {
    claimChanged: "claimChanged",
    statusChanged: "statusChanged",
  },
};
