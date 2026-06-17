import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { WeldEntity } from "@modules/weld/entities";
import { UserRoleModule } from "@modules/user-role";
import { WeldListModule } from "@modules/weld-list";
import { WeldController } from "@modules/weld/weld.controller";
import { WeldService } from "@modules/weld/weld.service";
import { WeldRepository } from "@modules/weld/weld.repository";

@Module({
  imports: [
    MikroOrmModule.forFeature([WeldEntity]),
    UserRoleModule,
    WeldListModule,
  ],
  controllers: [WeldController],
  providers: [WeldService, WeldRepository],
})
export class WeldModule {}
