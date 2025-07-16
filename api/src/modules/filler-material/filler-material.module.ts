import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { UserRoleModule } from "@modules/user-role";
import { FillerMaterialController } from "@modules/filler-material/filler-material.controller";
import { FillerMaterialService } from "@modules/filler-material/filler-material.service";
import { FillerMaterialRepository } from "@modules/filler-material/filler-material.repository";

@Module({
  imports: [MikroOrmModule.forFeature([FillerMaterialEntity]), UserRoleModule],
  controllers: [FillerMaterialController],
  providers: [FillerMaterialService, FillerMaterialRepository],
})
export class FillerMaterialModule {}
