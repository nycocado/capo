import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "@modules/auth/auth.service";
import { UserService } from "@modules/user";
import { ApiLogin, ApiLogout, ApiMe } from "@modules/auth/auth.swagger";
import { LoginRequestDto } from "@modules/auth/dto";
import { JwtCookieAuthGuard } from "@common/guards";
import { User } from "@common/decorators";
import { UserEntity } from "@modules/user/entities";
import { durationToMs } from "@common/utils/parse-duration";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiLogin()
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const { internalId, password } = loginDto;
    const { accessToken, user } = await this.authService.login(
      internalId,
      password,
    );

    res.cookie("token", accessToken, {
      ...this.baseCookieOptions(),
      maxAge: durationToMs(
        this.configService.get<string>("JWT_EXPIRATION") ?? "8h",
      ),
    });

    return user;
  }

  @UseGuards(JwtCookieAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogout()
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie("token", this.baseCookieOptions());
  }

  @UseGuards(JwtCookieAuthGuard)
  @Get("me")
  @ApiMe()
  async getMe(@User("id") userId: number): Promise<UserEntity> {
    return this.userService.findOneWithRolesById(userId);
  }

  /** Atributos do cookie de sessão partilhados entre set (login) e clear (logout). */
  private baseCookieOptions() {
    const isProduction = this.configService.get("NODE_ENV") === "production";
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
    };
  }
}
