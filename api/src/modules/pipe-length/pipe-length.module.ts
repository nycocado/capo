import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { UserRoleModule } from "@modules/user-role";
import { CutListModule } from "@modules/cut-list";
import { PipeLengthController } from "@modules/pipe-length/pipe-length.controller";
import { PipeLengthService } from "@modules/pipe-length/pipe-length.service";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";

@Module({
  imports: [
    MikroOrmModule.forFeature([PipeLengthEntity]),
    UserRoleModule,
    CutListModule,
  ],
  controllers: [PipeLengthController],
  providers: [PipeLengthService, PipeLengthRepository],
})
export class PipeLengthModule {}
