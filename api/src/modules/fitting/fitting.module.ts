import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { FittingEntity } from "@modules/fitting/entities";
import { UserRoleModule } from "@modules/user-role";
import { FittingController } from "@modules/fitting/fitting.controller";
import { FittingService } from "@modules/fitting/fitting.service";
import { FittingRepository } from "@modules/fitting/fitting.repository";

@Module({
  imports: [MikroOrmModule.forFeature([FittingEntity]), UserRoleModule],
  controllers: [FittingController],
  providers: [FittingService, FittingRepository],
})
export class FittingModule {}
