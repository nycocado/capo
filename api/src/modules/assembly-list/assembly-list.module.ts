import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role";
import { WsAuthModule } from "@common/ws";
import { AssemblyListController } from "@modules/assembly-list/assembly-list.controller";
import { AssemblyListGateway } from "@modules/assembly-list/assembly-list.gateway";
import {
  ClaimAssemblyListHandler,
  GetAssemblyListHandler,
  GetAssemblyListsHandler,
  GetPendingAssemblyCountHandler,
  ReassignAssemblyListHandler,
  ReleaseAssemblyListHandler,
} from "@modules/assembly-list/application/handlers";
import {
  AssemblyListClaimChangedProjection,
  AssemblyListJointStatusProjection,
  AssemblyListUpstreamProjection,
} from "@modules/assembly-list/events/assembly-list.projection";

const imports = [
  MikroOrmModule.forFeature([AssemblyListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
  WsAuthModule,
];

const controllers = [AssemblyListController];

const providers = [
  AssemblyListGateway,
  ClaimAssemblyListHandler,
  ReleaseAssemblyListHandler,
  ReassignAssemblyListHandler,
  GetAssemblyListsHandler,
  GetAssemblyListHandler,
  GetPendingAssemblyCountHandler,
  AssemblyListClaimChangedProjection,
  AssemblyListUpstreamProjection,
  AssemblyListJointStatusProjection,
];

@Module({ imports, controllers, providers })
export class AssemblyListModule {}
