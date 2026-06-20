import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { WeldEntity } from "@modules/weld/entities/weld.entity";
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role/user-role.module";
import { WeldController } from "@modules/weld/weld.controller";
import {
  CreateWeldStatusEventHandler,
  GetWeldHandler,
  GetWeldStatusEventsHandler,
} from "@modules/weld/application/handlers";

const imports = [
  MikroOrmModule.forFeature([WeldEntity, WeldListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
];

const controllers = [WeldController];

const providers = [
  CreateWeldStatusEventHandler,
  GetWeldHandler,
  GetWeldStatusEventsHandler,
];

@Module({ imports, controllers, providers })
export class WeldModule {}
