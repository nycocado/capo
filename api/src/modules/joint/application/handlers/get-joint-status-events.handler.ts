import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { JointStatusEventEntity } from "@modules/joint/entities/joint-status-event.entity";
import { JointRepository } from "@modules/joint/joint.repository";
import { GetJointStatusEventsQuery } from "@modules/joint/application/queries";

@QueryHandler(GetJointStatusEventsQuery)
export class GetJointStatusEventsHandler implements IQueryHandler<GetJointStatusEventsQuery> {
  constructor(
    @InjectRepository(JointEntity)
    private readonly joints: JointRepository,
  ) {}

  async execute({
    data,
  }: GetJointStatusEventsQuery): Promise<JointStatusEventEntity[]> {
    await this.joints.findByIdOrFail(data.id);
    return this.joints.findStatusEvents(data.id);
  }
}
