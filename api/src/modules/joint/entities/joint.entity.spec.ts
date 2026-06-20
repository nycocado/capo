import { ConflictException } from "@nestjs/common";
import { JointEntity, JointStatus } from "@modules/joint/entities/joint.entity";
import { JointStatusChangedEvent } from "@modules/joint/events/joint-status-changed.event";
import { UserEntity } from "@modules/user/entities/user.entity";

const user = { id: 3 } as UserEntity;

function makeJoint(status: JointStatus = JointStatus.TO_DO): JointEntity {
  const joint = new JointEntity();
  joint.status = status;
  return joint;
}

describe("JointEntity", () => {
  describe("complete", () => {
    it("move to_do → done e emite o evento", () => {
      const joint = makeJoint();

      joint.complete(user);

      expect(joint.status).toBe(JointStatus.DONE);

      const events = joint.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(JointStatusChangedEvent);
      expect((events[0] as JointStatusChangedEvent).userId).toBe(user.id);
    });

    it("rejeita concluir quando já está done com Conflict", () => {
      const joint = makeJoint(JointStatus.DONE);

      expect(() => joint.complete(user)).toThrow(ConflictException);
    });
  });
});
