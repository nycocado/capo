export class LoginCommand {
  constructor(readonly data: { internalId: string; password: string }) {}
}
