import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PipeLengthModule } from './pipe-length/pipe-length.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { CuttingOperatorModule } from './cutting-operator/cutting-operator.module';
import { PipeFitterModule } from './pipe-fitter/pipe-fitter.module';
import { WelderModule } from './welder/welder.module';
import { StatisticModule } from './statistic/statistic.module';
import { FittingModule } from './fitting/fitting.module';
import { WeldModule } from './weld/weld.module';
import { JointModule } from './joint/joint.module';
import { ProjectModule } from './project/project.module';
import { RevModule } from './rev/rev.module';
import { WpsModule } from './wps/wps.module';
import { FillerModule } from './filler/filler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    DatabaseModule,
    PipeLengthModule,
    AuthModule,
    UserModule,
    AdminModule,
    CuttingOperatorModule,
    PipeFitterModule,
    WelderModule,
    StatisticModule,
    FittingModule,
    WeldModule,
    JointModule,
    ProjectModule,
    RevModule,
    WpsModule,
    FillerModule,
  ],
  providers: [AppService],
})
export class AppModule {}
