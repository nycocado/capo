import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { microOrmConfig } from '@config/mikroorm.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '@modules/auth';
import { UserModule } from '@modules/user';
import { RoleModule } from '@modules/role';
import { UserRoleModule } from '@modules/user-role';
import { ProjectModule } from '@modules/project';
import { PipeLengthModule } from '@modules/pipe-length';
import { FittingModule } from '@modules/fitting';
import { CutListModule } from '@modules/cut-list';
import { JointModule } from '@modules/joint';
import { WeldModule } from '@modules/weld';
import { AssemblyListModule } from '@modules/assembly-list';
import { WeldListModule } from '@modules/weld-list';
import { FillerMaterialModule } from '@modules/filler-material';
import { WpsModule } from '@modules/wps';
import { DocumentModule } from '@modules/document';
import { MikroOrmNotFoundInterceptor } from '@common/interceptors';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    MikroOrmModule.forRoot(microOrmConfig),
    EventEmitterModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    UserRoleModule,
    ProjectModule,
    PipeLengthModule,
    FittingModule,
    CutListModule,
    JointModule,
    WeldModule,
    AssemblyListModule,
    WeldListModule,
    FillerMaterialModule,
    WpsModule,
    DocumentModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({ transform: true }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MikroOrmNotFoundInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
