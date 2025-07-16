import { Module } from "@nestjs/common";
import { WpsController } from "@modules/wps/wps.controller";
import { WpsService } from "@modules/wps/wps.service";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { WpsEntity } from "@modules/wps/entities";
import { UserRoleModule } from "@modules/user-role";
import { WpsRepository } from "@modules/wps/wps.repository";

@Module({
  imports: [MikroOrmModule.forFeature([WpsEntity]), UserRoleModule],
  controllers: [WpsController],
  providers: [WpsService, WpsRepository],
})
export class WpsModule {}
