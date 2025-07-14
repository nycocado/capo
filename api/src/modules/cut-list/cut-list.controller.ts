import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CutListService } from '@modules/cut-list/cut-list.service';
import { JwtCookieAuthGuard, RolesGuard } from '@common/guards';
import { Roles, SerializeResponse, User } from '@common/decorators';
import { CutListResponseDto } from '@modules/cut-list/dto';
import { CutListEntity } from '@modules/cut-list/entities';

@Controller('cut-lists')
export class CutListController {
  constructor(private readonly cutListService: CutListService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('cutting-operator', 'administrator')
  @Get('to-do')
  @SerializeResponse(CutListResponseDto, 'cut-list')
  async getCutListsToDo(): Promise<CutListEntity[]> {
    return this.cutListService.getToDo();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('cutting-operator', 'administrator')
  @Get(':id')
  @SerializeResponse(CutListResponseDto, 'cut-list')
  async getCutListById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CutListEntity> {
    return this.cutListService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles('cutting-operator', 'administrator')
  @Patch(':id/set-working')
  @SerializeResponse(CutListResponseDto, 'cut-list')
  async setCutListToWorking(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) cutListId: number,
  ): Promise<CutListEntity> {
    const cutList = await this.cutListService.getById(cutListId);
    return this.cutListService.updateWorkStatusToWorking(cutList, userId);
  }
}
