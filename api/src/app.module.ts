import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { MariaDbDriver } from "@mikro-orm/mariadb";
import { createMikroOrmConfig } from "@config/mikroorm.config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AuthModule } from "@modules/auth";
import { UserModule } from "@modules/user";
import { UserRoleModule } from "@modules/user-role";
import { PipeLengthModule } from "@modules/pipe-length";
import { CutListModule } from "@modules/cut-list";
import { JointModule } from "@modules/joint";
import { WeldModule } from "@modules/weld";
import { AssemblyListModule } from "@modules/assembly-list";
import { WeldListModule } from "@modules/weld-list";
import { FillerMaterialModule } from "@modules/filler-material";
import { WpsModule } from "@modules/wps";
import { DocumentModule } from "@modules/document";
import { MikroOrmNotFoundInterceptor } from "@common/interceptors";
import { AllExceptionsFilter } from "@common/filters";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env"] }),
    MikroOrmModule.forRootAsync({
      driver: MariaDbDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createMikroOrmConfig(config),
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UserModule,
    UserRoleModule,
    PipeLengthModule,
    CutListModule,
    JointModule,
    WeldModule,
    AssemblyListModule,
    WeldListModule,
    FillerMaterialModule,
    WpsModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          transformOptions: { enableImplicitConversion: false },
        }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MikroOrmNotFoundInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule {}
