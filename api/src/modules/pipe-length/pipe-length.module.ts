import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { CutListEntity } from "@modules/cut-list/entities";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role";
import { PipeLengthController } from "@modules/pipe-length/pipe-length.controller";
import {
  CreatePipeLengthStatusEventHandler,
  GetPipeLengthHandler,
  GetPipeLengthStatusEventsHandler,
} from "@modules/pipe-length/application/use-cases";

const imports = [
  MikroOrmModule.forFeature([PipeLengthEntity, CutListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
];

const controllers = [PipeLengthController];

const providers = [
  CreatePipeLengthStatusEventHandler,
  GetPipeLengthHandler,
  GetPipeLengthStatusEventsHandler,
];

@Module({ imports, controllers, providers })
export class PipeLengthModule {}
