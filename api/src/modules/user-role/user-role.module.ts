import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserRoleEntity } from "@modules/user-role/entities";
import { UserRoleService } from "@modules/user-role/user-role.service";
import { UserRoleRepository } from "@modules/user-role/user-role.repository";

@Module({
  imports: [MikroOrmModule.forFeature([UserRoleEntity])],
  providers: [UserRoleService, UserRoleRepository],
  exports: [UserRoleService],
})
export class UserRoleModule {}
