import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { UserRoleModule } from "@modules/user-role";
import { WeldListController } from "@modules/weld-list/weld-list.controller";
import { WeldListService } from "@modules/weld-list/weld-list.service";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";

@Module({
  imports: [MikroOrmModule.forFeature([WeldListEntity]), UserRoleModule],
  controllers: [WeldListController],
  providers: [WeldListService, WeldListRepository],
  exports: [WeldListService],
})
export class WeldListModule {}
