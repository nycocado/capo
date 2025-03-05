import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleEntity } from './entity/role.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('roles')
  @ApiOkResponse({ type: Array<RoleEntity> })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getRoles(@Req() req: any): Promise<RoleEntity[]> {
    return this.userService.getRoles(req.user.id);
  }
}
