import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserRoleEntity } from "@modules/user-role/entities/user-role.entity";
import { UserRoleService } from "@modules/user-role/user-role.service";

const imports = [MikroOrmModule.forFeature([UserRoleEntity])];

const providers = [UserRoleService];

@Module({ imports, providers, exports: [UserRoleService] })
export class UserRoleModule {}
