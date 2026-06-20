export class ClaimWeldListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReleaseWeldListCommand {
  constructor(readonly data: { listId: number; userId: number }) {}
}

export class ReassignWeldListCommand {
  constructor(readonly data: { listId: number; targetUserId: number }) {}
}
