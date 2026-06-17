import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { WeldListController } from "@modules/weld-list/weld-list.controller";
import { WeldListService } from "@modules/weld-list/weld-list.service";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { WeldListGateway } from "@modules/weld-list/weld-list.gateway";

@Module({
  imports: [
    MikroOrmModule.forFeature([WeldListEntity]),
    UserRoleModule,
    WsAuthModule,
  ],
  controllers: [WeldListController],
  providers: [WeldListService, WeldListRepository, WeldListGateway],
  exports: [WeldListService],
})
export class WeldListModule {}
