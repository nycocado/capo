import { Module } from "@nestjs/common";
import { UserModule } from "@modules/user";
import { UserRoleModule } from "@modules/user-role";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";
import { JwtCookieStrategy } from "@modules/auth/jwt-cookie-strategy.service";

@Module({
  imports: [
    UserModule,
    UserRoleModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get("JWT_SECRET"),
        signOptions: { expiresIn: "8h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtCookieStrategy],
})
export class AuthModule {}
