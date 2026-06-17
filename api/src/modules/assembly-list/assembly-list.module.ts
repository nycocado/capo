import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { UserRoleModule } from "@modules/user-role";
import { AssemblyListController } from "@modules/assembly-list/assembly-list.controller";
import { AssemblyListService } from "@modules/assembly-list/assembly-list.service";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";

@Module({
  imports: [MikroOrmModule.forFeature([AssemblyListEntity]), UserRoleModule],
  controllers: [AssemblyListController],
  providers: [AssemblyListService, AssemblyListRepository],
  exports: [AssemblyListService],
})
export class AssemblyListModule {}
