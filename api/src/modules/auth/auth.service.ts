import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@modules/user";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(internalId: string, password: string): Promise<string> {
    const user = await this.userService.getByInternalId(internalId);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      internalId: user.internalId,
    };

    return this.jwtService.sign(payload);
  }
}
