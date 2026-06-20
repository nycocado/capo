import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "@modules/user/user.service";
import { UserEntity } from "@modules/user/entities/user.entity";
import { LoginCommand } from "@modules/auth/application/commands";

export interface LoginResult {
  accessToken: string;
  user: UserEntity;
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ data }: LoginCommand): Promise<LoginResult> {
    const user = await this.userService.getByInternalId(data.internalId);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      internalId: user.internalId,
    });
    const authenticated = await this.userService.findOneWithRolesById(user.id);

    return { accessToken, user: authenticated };
  }
}
