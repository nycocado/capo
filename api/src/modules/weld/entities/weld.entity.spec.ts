import { BadRequestException, ConflictException } from "@nestjs/common";
import { WeldEntity, WeldStatus } from "@modules/weld/entities/weld.entity";
import { WeldStatusChangedEvent } from "@modules/weld/events/weld-status-changed.event";
import { FillerMaterialEntity } from "@modules/filler-material/entities/filler-material.entity";
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { UserEntity } from "@modules/user/entities/user.entity";

const user = { id: 9 } as UserEntity;
const filler = { id: 1 } as FillerMaterialEntity;
const wps = { id: 2 } as WpsEntity;

function makeWeld(
  status: WeldStatus = WeldStatus.TO_DO,
  preset: { filler?: FillerMaterialEntity; wps?: WpsEntity } = {},
): WeldEntity {
  const weld = new WeldEntity();
  weld.status = status;
  weld.fillerMaterial = preset.filler;
  weld.wps = preset.wps;
  return weld;
}

describe("WeldEntity", () => {
  describe("complete", () => {
    it("move to_do → done com filler e wps, e emite o evento", () => {
      const weld = makeWeld();

      weld.complete(filler, wps, user);

      expect(weld.status).toBe(WeldStatus.DONE);
      expect(weld.fillerMaterial).toBe(filler);
      expect(weld.wps).toBe(wps);

      const events = weld.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(WeldStatusChangedEvent);
      expect((events[0] as WeldStatusChangedEvent).userId).toBe(user.id);
    });

    it("reutiliza filler e wps já gravados quando não recebe novos", () => {
      const weld = makeWeld(WeldStatus.TO_DO, { filler, wps });

      weld.complete(undefined, undefined, user);

      expect(weld.status).toBe(WeldStatus.DONE);
      expect(weld.fillerMaterial).toBe(filler);
      expect(weld.wps).toBe(wps);
    });

    it("rejeita sem filler (nem novo nem existente) com BadRequest", () => {
      const weld = makeWeld(WeldStatus.TO_DO, { wps });

      expect(() => weld.complete(undefined, undefined, user)).toThrow(
        BadRequestException,
      );
      expect(weld.status).toBe(WeldStatus.TO_DO);
    });

    it("rejeita sem wps (nem novo nem existente) com BadRequest", () => {
      const weld = makeWeld(WeldStatus.TO_DO, { filler });

      expect(() => weld.complete(undefined, undefined, user)).toThrow(
        BadRequestException,
      );
    });

    it("rejeita concluir quando já está done com Conflict", () => {
      const weld = makeWeld(WeldStatus.DONE, { filler, wps });

      expect(() => weld.complete(filler, wps, user)).toThrow(ConflictException);
    });
  });
});
