import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { JwtCookieAuthGuard, RolesGuard } from "@common/guards";
import { Roles } from "@common/decorators";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import {
  GetFillerMaterialQuery,
  GetFillerMaterialsQuery,
} from "@modules/filler-material/application/queries";

@Controller("filler-materials")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@Roles("welder", "administrator")
export class FillerMaterialController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getAll(): Promise<FillerMaterialEntity[]> {
    return this.queryBus.execute<
      GetFillerMaterialsQuery,
      FillerMaterialEntity[]
    >(new GetFillerMaterialsQuery());
  }

  @Get(":id")
  getById(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<FillerMaterialEntity> {
    return this.queryBus.execute<GetFillerMaterialQuery, FillerMaterialEntity>(
      new GetFillerMaterialQuery({ id }),
    );
  }
}
