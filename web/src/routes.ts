const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL!
    : process.env.NEXT_PUBLIC_API_URL!;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

export const ROUTES = {
  home: "/",
  login: "/login",
  roles: "/roles",
  cut: "/cut",
  assembly: "/assembly",
  weld: "/weld",
  unauthorized: "/unauthorized",
};

export const API_ROUTES = {
  auth: {
    base: `${API_URL}/auth`,
    login: `${API_URL}/auth/login`,
    validate: `${API_URL}/auth/validate`,
    hasRole: (role: string) => `${API_URL}/auth/has-role/${role}`,
  },
  users: {
    base: `${API_URL}/users`,
    me: `${API_URL}/users/me`,
  },
  roles: {
    base: `${API_URL}/roles`,
    me: `${API_URL}/roles/me`,
  },
  projects: {
    base: `${API_URL}/projects`,
    id: (id: number) => `${API_URL}/projects/${id}`,
  },
  pipeLengths: {
    base: `${API_URL}/pipe-lengths`,
    id: (id: number) => `${API_URL}/pipe-lengths/${id}`,
    step: (id: number) => `${API_URL}/pipe-lengths/${id}/step`,
    heatNumber: (id: number) => `${API_URL}/pipe-lengths/${id}/heat-number`,
  },
  fittings: {
    base: `${API_URL}/fittings`,
    id: (id: number) => `${API_URL}/fittings/${id}`,
  },
  joints: {
    base: `${API_URL}/joints`,
    id: (id: number) => `${API_URL}/joints/${id}`,
    step: (id: number) => `${API_URL}/joints/${id}/step`,
  },
  welds: {
    base: `${API_URL}/welds`,
    id: (id: number) => `${API_URL}/welds/${id}`,
    step: (id: number) => `${API_URL}/welds/${id}/step`,
    fillerMaterial: (id: number) => `${API_URL}/welds/${id}/filler-material`,
    wps: (id: number) => `${API_URL}/welds/${id}/wps`,
  },
  cutLists: {
    base: `${API_URL}/cut-lists`,
    toDo: `${API_URL}/cut-lists/to-do`,
    id: (id: number) => `${API_URL}/cut-lists/${id}`,
    setWorking: (id: number) => `${API_URL}/cut-lists/${id}/set-working`,
  },
  assemblyLists: {
    base: `${API_URL}/assembly-lists`,
    toDo: `${API_URL}/assembly-lists/to-do`,
    id: (id: number) => `${API_URL}/assembly-lists/${id}`,
    setWorking: (id: number) => `${API_URL}/assembly-lists/${id}/set-working`,
  },
  weldLists: {
    base: `${API_URL}/weld-lists`,
    toDo: `${API_URL}/weld-lists/to-do`,
    id: (id: number) => `${API_URL}/weld-lists/${id}`,
    setWorking: (id: number) => `${API_URL}/weld-lists/${id}/set-working`,
  },
  fillerMaterials: {
    base: `${API_URL}/filler-materials`,
    id: (id: number) => `${API_URL}/filler-materials/${id}`,
  },
  wps: {
    base: `${API_URL}/wps`,
    id: (id: number) => `${API_URL}/wps/${id}`,
  },
  documents: {
    base: `${API_URL}/documents`,
    download: (path: string) => `${API_URL}/documents/${path}`,
  },
};

export const WS_ROUTES = {
  cutList: `${WS_URL}/cut-list`,
  assemblyList: `${WS_URL}/assembly-list`,
  weldList: `${WS_URL}/weld-list`,
};

export const WS_EVENTS = {
  default: {
    connect: "connect",
    disconnect: "disconnect",
    connect_error: "connect_error",
    error: "error",
  },
  cutList: {
    updateWorkStatus: "updateWorkStatus",
  },
  assemblyList: {
    updateWorkStatus: "updateWorkStatus",
    create: "createAssemblyList",
  },
  weldList: {
    updatedWorkStatus: "updateWorkStatus",
    creates: "createsWeldList",
  },
};
