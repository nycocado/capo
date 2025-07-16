import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { JointEntity } from "@modules/joint/entities";
import { UserRoleModule } from "@modules/user-role";
import { JointController } from "@modules/joint/joint.controller";
import { JointService } from "@modules/joint/joint.service";
import { JointRepository } from "@modules/joint/joint.repository";

@Module({
  imports: [MikroOrmModule.forFeature([JointEntity]), UserRoleModule],
  controllers: [JointController],
  providers: [JointService, JointRepository],
})
export class JointModule {}
