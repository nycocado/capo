import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { RoleEntity } from "@modules/role/entities";
import { RoleController } from "@modules/role/role.controller";
import { RoleService } from "@modules/role/role.service";
import { RoleRepository } from "@modules/role/role.repository";

@Module({
  imports: [MikroOrmModule.forFeature([RoleEntity])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
})
export class RoleModule {}
