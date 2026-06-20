import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { UserRoleModule } from "@modules/user-role";
import { FillerMaterialController } from "@modules/filler-material/filler-material.controller";
import {
  GetFillerMaterialHandler,
  GetFillerMaterialsHandler,
} from "@modules/filler-material/application/handlers";

const imports = [
  MikroOrmModule.forFeature([FillerMaterialEntity]),
  CqrsModule,
  UserRoleModule,
];

const controllers = [FillerMaterialController];

const providers = [GetFillerMaterialsHandler, GetFillerMaterialHandler];

@Module({ imports, controllers, providers })
export class FillerMaterialModule {}
