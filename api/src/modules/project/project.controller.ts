import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '@modules/project/project.service';
import { JwtCookieAuthGuard, RolesGuard } from '@common/guards';
import { Roles, SerializeResponse } from '@common/decorators';
import { ProjectResponseDto } from '@modules/project/dto';
import { ProjectEntity } from '@modules/project/entities';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('administrator')
  @Get()
  @SerializeResponse(ProjectResponseDto, 'project')
  async getAllProjects(): Promise<ProjectEntity[]> {
    return this.projectService.getAll();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('administrator')
  @Get(':id')
  @SerializeResponse(ProjectResponseDto, 'project')
  async getProjectById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectEntity> {
    return this.projectService.getById(id);
  }
}
