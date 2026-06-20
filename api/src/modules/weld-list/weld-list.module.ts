import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { WeldListEntity } from "@modules/weld-list/entities";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { WeldListController } from "@modules/weld-list/weld-list.controller";
import { WeldListGateway } from "@modules/weld-list/weld-list.gateway";
import {
  ClaimWeldListHandler,
  GetPendingWeldCountHandler,
  GetWeldListHandler,
  GetWeldListsHandler,
  ReassignWeldListHandler,
  ReleaseWeldListHandler,
} from "@modules/weld-list/application/handlers";
import {
  WeldListClaimChangedProjection,
  WeldListUpstreamProjection,
  WeldListWeldStatusProjection,
} from "@modules/weld-list/events/weld-list.projection";

const imports = [
  MikroOrmModule.forFeature([WeldListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
  WsAuthModule,
];

const controllers = [WeldListController];

const providers = [
  WeldListGateway,
  ClaimWeldListHandler,
  ReleaseWeldListHandler,
  ReassignWeldListHandler,
  GetWeldListsHandler,
  GetWeldListHandler,
  GetPendingWeldCountHandler,
  WeldListClaimChangedProjection,
  WeldListUpstreamProjection,
  WeldListWeldStatusProjection,
];

@Module({ imports, controllers, providers })
export class WeldListModule {}
