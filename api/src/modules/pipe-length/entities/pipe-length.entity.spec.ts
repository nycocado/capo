import { BadRequestException, ConflictException } from "@nestjs/common";
import {
  PipeLengthEntity,
  PipeLengthStatus,
} from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events/pipe-length-status-changed.event";
import { UserEntity } from "@modules/user/entities/user.entity";

const user = { id: 7 } as UserEntity;

function makePipeLength(
  status: PipeLengthStatus = PipeLengthStatus.TO_DO,
  heatNumber?: string,
): PipeLengthEntity {
  const pl = new PipeLengthEntity();
  pl.status = status;
  pl.heatNumber = heatNumber;
  return pl;
}

describe("PipeLengthEntity", () => {
  describe("startCutting", () => {
    it("move to_do → in_progress, captura o heat e emite o evento", () => {
      const pl = makePipeLength();

      pl.startCutting("H-123", user);

      expect(pl.status).toBe(PipeLengthStatus.IN_PROGRESS);
      expect(pl.heatNumber).toBe("H-123");

      const events = pl.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(PipeLengthStatusChangedEvent);
      expect((events[0] as PipeLengthStatusChangedEvent).userId).toBe(user.id);
    });

    it("reutiliza o heat já gravado quando não recebe um novo", () => {
      const pl = makePipeLength(PipeLengthStatus.TO_DO, "H-existing");

      pl.startCutting(undefined, user);

      expect(pl.heatNumber).toBe("H-existing");
      expect(pl.status).toBe(PipeLengthStatus.IN_PROGRESS);
    });

    it("rejeita sem heat (nem novo nem existente) com BadRequest", () => {
      const pl = makePipeLength();

      expect(() => pl.startCutting(undefined, user)).toThrow(
        BadRequestException,
      );
      expect(pl.status).toBe(PipeLengthStatus.TO_DO);
    });

    it("rejeita iniciar quando já está in_progress com Conflict", () => {
      const pl = makePipeLength(PipeLengthStatus.IN_PROGRESS, "H-1");

      expect(() => pl.startCutting("H-2", user)).toThrow(ConflictException);
    });
  });

  describe("finishCutting", () => {
    it("move in_progress → done e emite o evento", () => {
      const pl = makePipeLength(PipeLengthStatus.IN_PROGRESS, "H-1");

      pl.finishCutting(user);

      expect(pl.status).toBe(PipeLengthStatus.DONE);
      expect(pl.pullDomainEvents()).toHaveLength(1);
    });

    it("rejeita concluir quando ainda em to_do com Conflict", () => {
      const pl = makePipeLength();

      expect(() => pl.finishCutting(user)).toThrow(ConflictException);
    });

    it("rejeita concluir quando já está done com Conflict", () => {
      const pl = makePipeLength(PipeLengthStatus.DONE, "H-1");

      expect(() => pl.finishCutting(user)).toThrow(ConflictException);
    });
  });

  describe("pullDomainEvents", () => {
    it("esvazia a fila após a leitura (não reemite)", () => {
      const pl = makePipeLength();
      pl.startCutting("H-1", user);

      expect(pl.pullDomainEvents()).toHaveLength(1);
      expect(pl.pullDomainEvents()).toHaveLength(0);
    });
  });
});
