import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleService } from '@modules/role/role.service';
import { JwtCookieAuthGuard } from '@common/guards';
import { ApiMyRoles } from '@modules/role/role.swagger';
import { SerializeResponse, User } from '@common/decorators';
import { RoleResponseDto } from '@modules/role/dto';
import { RoleEntity } from '@modules/role/entities';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(JwtCookieAuthGuard)
  @Get('me')
  @ApiMyRoles()
  @SerializeResponse(RoleResponseDto, 'role')
  async getMyRoles(@User('id') userId: number): Promise<RoleEntity[]> {
    return this.roleService.getAllByUserId(userId);
  }
}
