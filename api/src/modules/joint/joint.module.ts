import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { JointEntity } from "@modules/joint/entities";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role";
import { JointController } from "@modules/joint/joint.controller";
import {
  CreateJointStatusEventHandler,
  GetJointHandler,
  GetJointStatusEventsHandler,
} from "@modules/joint/application/handlers";

const imports = [
  MikroOrmModule.forFeature([JointEntity, AssemblyListEntity]),
  CqrsModule,
  DomainModule,
  UserRoleModule,
];

const controllers = [JointController];

const providers = [
  CreateJointStatusEventHandler,
  GetJointHandler,
  GetJointStatusEventsHandler,
];

@Module({ imports, controllers, providers })
export class JointModule {}
