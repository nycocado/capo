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
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Throttle } from "@nestjs/throttler";
import { ApiLogin, ApiLogout, ApiMe } from "@modules/auth/auth.swagger";
import { LoginRequestDto } from "@modules/auth/dto/login-request.dto";
import { LoginCommand } from "@modules/auth/application/commands";
import { LoginResult } from "@modules/auth/application/handlers/login.handler";
import { GetMeQuery } from "@modules/auth/application/queries";
import { JwtCookieAuthGuard } from "@common/guards";
import { User } from "@common/decorators";
import { UserEntity } from "@modules/user/entities/user.entity";
import { durationToMs } from "@common/utils/parse-duration";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
  ) {}

  @Post("login")
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiLogin()
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const { accessToken, user } = await this.commandBus.execute<
      LoginCommand,
      LoginResult
    >(
      new LoginCommand({
        internalId: loginDto.internalId,
        password: loginDto.password,
      }),
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
  getMe(@User("id") userId: number): Promise<UserEntity> {
    return this.queryBus.execute<GetMeQuery, UserEntity>(
      new GetMeQuery({ userId }),
    );
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
