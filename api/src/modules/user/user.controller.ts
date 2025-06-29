import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtCookieAuthGuard } from '@common/guards';
import { ApiMyUser } from '@modules/user/user.swagger';
import { SerializeResponse, User } from '@common/decorators';
import { UserResponseDto } from '@modules/user/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtCookieAuthGuard)
  @Get('me')
  @ApiMyUser()
  @SerializeResponse(UserResponseDto, 'user')
  async getMyUser(@User('id') userId: number) {
    return await this.userService.findOneWithRolesById(userId);
  }
}
