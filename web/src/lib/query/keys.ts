export const queryKeys = {
  currentUser: () => ["current-user"] as const,
  myRoles: () => ["roles", "me"] as const,
  cutLists: () => ["cut-lists"] as const,
  assemblyLists: () => ["assembly-lists"] as const,
  weldLists: () => ["weld-lists"] as const,
  wps: () => ["wps"] as const,
  fillerMaterials: () => ["filler-materials"] as const,
} as const;
