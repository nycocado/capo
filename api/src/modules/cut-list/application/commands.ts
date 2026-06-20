export class ClaimCutListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReleaseCutListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReassignCutListCommand {
  constructor(readonly data: { listId: number; targetUserId: number }) {}
}
