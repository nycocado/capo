import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthStatusEventEntity } from "@modules/pipe-length/entities/pipe-length-status-event.entity";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";
import { GetPipeLengthStatusEventsQuery } from "@modules/pipe-length/application/queries";

@QueryHandler(GetPipeLengthStatusEventsQuery)
export class GetPipeLengthStatusEventsHandler implements IQueryHandler<GetPipeLengthStatusEventsQuery> {
  constructor(
    @InjectRepository(PipeLengthEntity)
    private readonly pipeLengths: PipeLengthRepository,
  ) {}

  async execute({
    data,
  }: GetPipeLengthStatusEventsQuery): Promise<PipeLengthStatusEventEntity[]> {
    await this.pipeLengths.findByIdOrFail(data.id);
    return this.pipeLengths.findStatusEvents(data.id);
  }
}
