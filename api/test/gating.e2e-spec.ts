import { Test, TestingModule } from "@nestjs/testing";
import { MikroORM } from "@mikro-orm/core";
import { AppModule } from "../src/app.module";
import { AssemblyListEntity } from "../src/modules/assembly-list/entities/assembly-list.entity";
import { AssemblyListRepository } from "../src/modules/assembly-list/assembly-list.repository";

describe("Gating cross-stage corte → montagem (e2e)", () => {
  let moduleRef: TestingModule;
  let orm: MikroORM;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    orm = moduleRef.get(MikroORM);
  });

  afterAll(async () => {
    await orm.close(true);
    await moduleRef.close();
  });

  it("uma assembly-list só fica disponível quando o corte do seu isométrico termina", async () => {
    const em = orm.em.fork();
    const repo = em.getRepository(AssemblyListEntity) as AssemblyListRepository;

    const availableBefore = await repo.loadAllLight();
    const availableIds = new Set(availableBefore.map((l) => l.id));

    const all = await em.find(
      AssemblyListEntity,
      {},
      { populate: ["isometric"] },
    );
    const target = all.find((l) => !availableIds.has(l.id));
    expect(target).toBeDefined();
    const isoId = target!.isometric.id;

    await repo.getEntityManager().execute(
      `UPDATE pipe_length pl
       JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
       JOIN spool s ON s.id = j.spool_id
       SET pl.status = 'done'
       WHERE s.isometric_id = ?`,
      [isoId],
    );

    const fresh = orm.em.fork();
    const freshRepo = fresh.getRepository(
      AssemblyListEntity,
    ) as AssemblyListRepository;
    const availableAfter = await freshRepo.loadAllLight();

    expect(availableAfter.map((l) => l.id)).toContain(target!.id);
  });
});
