import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findForAdmin(@Req() req: any) {
    return this.projectService.findAllForAdmin(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOneForAdmin(@Param('id') id: number, @Req() req: any) {
    return this.projectService.findOneForAdmin(+id, req.user.id);
  }
}
