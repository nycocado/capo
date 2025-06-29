import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProjectEntity } from '@modules/project/entities';
import { UserRoleModule } from '@modules/user-role';
import { ProjectController } from '@modules/project/project.controller';
import { ProjectService } from '@modules/project/project.service';
import { ProjectRepository } from '@modules/project/project.repository';

@Module({
  imports: [MikroOrmModule.forFeature([ProjectEntity]), UserRoleModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
