export class ClaimAssemblyListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReleaseAssemblyListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReassignAssemblyListCommand {
  constructor(readonly data: { listId: number; targetUserId: number }) {}
}
