import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

/**
 * Disponibiliza um `JwtService` configurado com o `JWT_SECRET` para a
 * autenticação no handshake dos gateways WebSocket. Importado pelos módulos
 * de estágio que registam gateways.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
      }),
    }),
  ],
  exports: [JwtModule],
})
export class WsAuthModule {}
