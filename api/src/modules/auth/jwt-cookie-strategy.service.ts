import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "@modules/user/user.service";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { UserEntity } from "@modules/user/entities/user.entity";

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(
  Strategy,
  "jwt-cookie",
) {
  constructor(
    private userService: UserService,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.getOrThrow<string>("JWT_SECRET");

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.["token"],
      ]),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: {
    sub: number;
    internalId: string;
  }): Promise<UserEntity> {
    return await this.userService.getById(payload.sub);
  }
}
