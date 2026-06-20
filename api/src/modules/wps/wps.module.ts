import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { UserRoleModule } from "@modules/user-role/user-role.module";
import { WpsController } from "@modules/wps/wps.controller";
import {
  GetWpsHandler,
  GetWpsListHandler,
} from "@modules/wps/application/handlers";

const imports = [
  MikroOrmModule.forFeature([WpsEntity]),
  CqrsModule,
  UserRoleModule,
];

const controllers = [WpsController];

const providers = [GetWpsListHandler, GetWpsHandler];

@Module({ imports, controllers, providers })
export class WpsModule {}
