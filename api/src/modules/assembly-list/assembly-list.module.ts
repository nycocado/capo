import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { AssemblyListController } from "@modules/assembly-list/assembly-list.controller";
import { AssemblyListService } from "@modules/assembly-list/assembly-list.service";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { AssemblyListGateway } from "@modules/assembly-list/assembly-list.gateway";

@Module({
  imports: [
    MikroOrmModule.forFeature([AssemblyListEntity]),
    UserRoleModule,
    WsAuthModule,
  ],
  controllers: [AssemblyListController],
  providers: [AssemblyListService, AssemblyListRepository, AssemblyListGateway],
  exports: [AssemblyListService],
})
export class AssemblyListModule {}
