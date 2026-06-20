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
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { GetWpsListQuery, GetWpsQuery } from "@modules/wps/application/queries";

@Controller("wps")
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@Roles("welder", "administrator")
export class WpsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getAll(): Promise<WpsEntity[]> {
    return this.queryBus.execute<GetWpsListQuery, WpsEntity[]>(
      new GetWpsListQuery(),
    );
  }

  @Get(":id")
  getById(@Param("id", ParseIntPipe) id: number): Promise<WpsEntity> {
    return this.queryBus.execute<GetWpsQuery, WpsEntity>(
      new GetWpsQuery({ id }),
    );
  }
}
