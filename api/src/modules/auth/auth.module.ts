import { Module } from "@nestjs/common";
import { UserModule } from "@modules/user";
import { UserRoleModule } from "@modules/user-role";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";
import { JwtCookieStrategy } from "@modules/auth/jwt-cookie-strategy.service";
import { durationToMs } from "@common/utils/parse-duration";

@Module({
  imports: [
    UserModule,
    UserRoleModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get("JWT_SECRET"),
        // expiresIn em segundos; deriva do mesmo JWT_EXPIRATION que o cookie
        signOptions: {
          expiresIn: durationToMs(cs.get<string>("JWT_EXPIRATION") ?? "8h") / 1000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtCookieStrategy],
})
export class AuthModule {}
