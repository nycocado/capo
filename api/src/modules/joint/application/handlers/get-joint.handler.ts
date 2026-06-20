import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { JointEntity } from "@modules/joint/entities";
import { JointRepository } from "@modules/joint/joint.repository";
import { GetJointQuery } from "@modules/joint/application/queries";

@QueryHandler(GetJointQuery)
export class GetJointHandler implements IQueryHandler<GetJointQuery> {
  constructor(
    @InjectRepository(JointEntity)
    private readonly joints: JointRepository,
  ) {}

  execute({ data }: GetJointQuery): Promise<JointEntity> {
    return this.joints.loadDetail(data.id);
  }
}
