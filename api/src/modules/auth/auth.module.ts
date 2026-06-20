import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserModule } from "@modules/user";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "@modules/auth/auth.controller";
import { JwtCookieStrategy } from "@modules/auth/jwt-cookie-strategy.service";
import { GetMeHandler, LoginHandler } from "@modules/auth/application/handlers";
import { durationToMs } from "@common/utils/parse-duration";

const imports = [
  CqrsModule,
  UserModule,
  PassportModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (cs: ConfigService) => ({
      secret: cs.getOrThrow<string>("JWT_SECRET"),
      // expiresIn em segundos; deriva do mesmo JWT_EXPIRATION que o cookie
      signOptions: {
        expiresIn:
          durationToMs(cs.get<string>("JWT_EXPIRATION") ?? "8h") / 1000,
      },
    }),
    inject: [ConfigService],
  }),
];

const controllers = [AuthController];

const providers = [LoginHandler, GetMeHandler, JwtCookieStrategy];

@Module({ imports, controllers, providers })
export class AuthModule {}
