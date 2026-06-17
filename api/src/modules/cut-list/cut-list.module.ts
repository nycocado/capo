import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CutListEntity } from "@modules/cut-list/entities";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { CutListController } from "@modules/cut-list/cut-list.controller";
import { CutListService } from "@modules/cut-list/cut-list.service";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { CutListGateway } from "@modules/cut-list/cut-list.gateway";

@Module({
  imports: [
    MikroOrmModule.forFeature([CutListEntity]),
    UserRoleModule,
    WsAuthModule,
  ],
  controllers: [CutListController],
  providers: [CutListService, CutListRepository, CutListGateway],
  exports: [CutListService],
})
export class CutListModule {}
