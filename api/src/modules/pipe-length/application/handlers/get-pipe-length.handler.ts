import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";
import { GetPipeLengthQuery } from "@modules/pipe-length/application/queries";

@QueryHandler(GetPipeLengthQuery)
export class GetPipeLengthHandler implements IQueryHandler<GetPipeLengthQuery> {
  constructor(
    @InjectRepository(PipeLengthEntity)
    private readonly pipeLengths: PipeLengthRepository,
  ) {}

  execute({ data }: GetPipeLengthQuery): Promise<PipeLengthEntity> {
    return this.pipeLengths.loadDetail(data.id);
  }
}
