import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { CutListEntity } from "@modules/cut-list/entities";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { CutListController } from "@modules/cut-list/cut-list.controller";
import { CutListGateway } from "@modules/cut-list/cut-list.gateway";
import {
  ClaimCutListHandler,
  GetCutListHandler,
  GetCutListsHandler,
  GetPendingCutCountHandler,
  ReassignCutListHandler,
  ReleaseCutListHandler,
} from "@modules/cut-list/application/use-cases";
import {
  CutListClaimChangedProjection,
  CutListPipeLengthStatusProjection,
} from "@modules/cut-list/events/cut-list.projection";

const imports = [
  MikroOrmModule.forFeature([CutListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
  WsAuthModule,
];

const controllers = [CutListController];

const providers = [
  CutListGateway,
  ClaimCutListHandler,
  ReleaseCutListHandler,
  ReassignCutListHandler,
  GetCutListsHandler,
  GetCutListHandler,
  GetPendingCutCountHandler,
  CutListClaimChangedProjection,
  CutListPipeLengthStatusProjection,
];

@Module({ imports, controllers, providers })
export class CutListModule {}
