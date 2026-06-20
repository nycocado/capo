import { ConflictException } from "@nestjs/common";
import { UserEntity } from "@modules/user/entities/user.entity";
import { ListProgress } from "@shared/types";
import { CutListEntity } from "@modules/cut-list/entities/cut-list.entity";
import { CutListClaimChangedEvent } from "@modules/cut-list/events/cut-list-claim-changed.event";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { AssemblyListClaimChangedEvent } from "@modules/assembly-list/events/assembly-list-claim-changed.event";
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { WeldListClaimChangedEvent } from "@modules/weld-list/events/weld-list-claim-changed.event";

interface ClaimLockList {
  id: number;
  claimedBy?: UserEntity;
  claimedAt?: Date;
  claimBy(
    user: UserEntity,
    ctx: { available: boolean; progress: ListProgress },
  ): void;
  release(): void;
  reassignTo(user: UserEntity): void;
  pullDomainEvents(): object[];
}

interface ClaimChangedEvent {
  listId: number;
  userId: number | null;
}

const cases: {
  name: string;
  create: () => ClaimLockList;
  Event: new (...args: never[]) => object;
}[] = [
  {
    name: "CutListEntity",
    create: () => new CutListEntity(),
    Event: CutListClaimChangedEvent,
  },
  {
    name: "AssemblyListEntity",
    create: () => new AssemblyListEntity(),
    Event: AssemblyListClaimChangedEvent,
  },
  {
    name: "WeldListEntity",
    create: () => new WeldListEntity(),
    Event: WeldListClaimChangedEvent,
  },
];

describe.each(cases)("$name (claim lock)", ({ create, Event }) => {
  const alice = { id: 1 } as UserEntity;
  const bob = { id: 2 } as UserEntity;
  const available = { available: true, progress: ListProgress.TO_DO };

  function makeList(claimedBy?: UserEntity): ClaimLockList {
    const list = create();
    list.id = 10;
    list.claimedBy = claimedBy;
    return list;
  }

  describe("claimBy", () => {
    it("reivindica uma lista disponível e emite o evento", () => {
      const list = makeList();

      list.claimBy(alice, available);

      expect(list.claimedBy).toBe(alice);
      expect(list.claimedAt).toBeInstanceOf(Date);

      const events = list.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(Event);
      expect((events[0] as ClaimChangedEvent).userId).toBe(alice.id);
    });

    it("é idempotente para o mesmo dono", () => {
      const list = makeList(alice);

      expect(() => list.claimBy(alice, available)).not.toThrow();
      expect(list.claimedBy).toBe(alice);
    });

    it("rejeita quando o estágio anterior não está completo", () => {
      const list = makeList();

      expect(() =>
        list.claimBy(alice, { available: false, progress: ListProgress.TO_DO }),
      ).toThrow(ConflictException);
    });

    it("rejeita reivindicar uma ordem já concluída", () => {
      const list = makeList();

      expect(() =>
        list.claimBy(alice, { available: true, progress: ListProgress.DONE }),
      ).toThrow(ConflictException);
    });

    it("rejeita quando já reivindicada por outro utilizador", () => {
      const list = makeList(bob);

      expect(() => list.claimBy(alice, available)).toThrow(ConflictException);
    });
  });

  describe("release", () => {
    it("liberta o lock e emite o evento com userId null", () => {
      const list = makeList(alice);

      list.release();

      expect(list.claimedBy).toBeUndefined();
      expect(list.claimedAt).toBeUndefined();

      const events = list.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect((events[0] as ClaimChangedEvent).userId).toBeNull();
    });
  });

  describe("reassignTo", () => {
    it("reatribui o lock a outro utilizador, sem verificar disponibilidade", () => {
      const list = makeList(alice);

      list.reassignTo(bob);

      expect(list.claimedBy).toBe(bob);
      expect((list.pullDomainEvents()[0] as ClaimChangedEvent).userId).toBe(
        bob.id,
      );
    });
  });
});
