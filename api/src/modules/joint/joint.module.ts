import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { CqrsModule } from "@nestjs/cqrs";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { DomainModule } from "@common/domain";
import { UserRoleModule } from "@modules/user-role/user-role.module";
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
