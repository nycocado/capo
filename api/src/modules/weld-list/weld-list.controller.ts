import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { WeldListService } from '@modules/weld-list/weld-list.service';
import { JwtCookieAuthGuard, RolesGuard } from '@common/guards';
import { Roles, SerializeResponse, User } from '@common/decorators';
import { WeldListResponseDto } from '@modules/weld-list/dto';
import { WeldListEntity } from '@modules/weld-list/entities';

@Controller('weld-lists')
export class WeldListController {
  constructor(private readonly weldListService: WeldListService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('welder')
  @Get('to-do')
  @SerializeResponse(WeldListResponseDto, 'weld-list')
  async getToDoWeldLists(): Promise<WeldListEntity[]> {
    return this.weldListService.getToDo();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('welder')
  @Get(':id')
  @SerializeResponse(WeldListResponseDto, 'weld-list')
  async getWeldListById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WeldListEntity> {
    return this.weldListService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('welder')
  @Patch(':id/set-working')
  @SerializeResponse(WeldListResponseDto, 'weld-list')
  async setWeldListToWorking(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WeldListEntity> {
    const weldList = await this.weldListService.getById(id);
    return this.weldListService.updateWorkStatusToWorking(weldList, userId);
  }
}
