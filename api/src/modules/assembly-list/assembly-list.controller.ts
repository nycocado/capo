import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { AssemblyListService } from "@modules/assembly-list/assembly-list.service";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles, SerializeResponse, User } from "@common/decorators";
import { AssemblyListResponseDto } from "@modules/assembly-list/dto";
import { AssemblyListEntity } from "@modules/assembly-list/entities";

@Controller("assembly-lists")
export class AssemblyListController {
  constructor(private readonly assemblyListService: AssemblyListService) {}

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "admin")
  @Get("to-do")
  @SerializeResponse(AssemblyListResponseDto, "assembly-list")
  async getAssemblyListsToDo(): Promise<AssemblyListEntity[]> {
    return this.assemblyListService.getToDo();
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "admin")
  @Get(":id")
  @SerializeResponse(AssemblyListResponseDto, "assembly-list")
  async getAssemblyListById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListService.getById(id);
  }

  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @Roles("pipe-fitter", "admin")
  @Patch(":id/set-working")
  @SerializeResponse(AssemblyListResponseDto, "assembly-list")
  async setAssemblyListToWorking(
    @User("id") userId: number,
    @Param("id", ParseIntPipe) assemblyListId: number,
  ): Promise<AssemblyListEntity> {
    const assemblyList = await this.assemblyListService.getById(assemblyListId);
    return this.assemblyListService.updateWorkStatusToWorking(
      assemblyList,
      userId,
    );
  }
}
