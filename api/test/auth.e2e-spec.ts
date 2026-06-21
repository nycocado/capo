import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let cookie: string[];
  let loginBody: Record<string, unknown>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ internalId: "UJS8342", password: "teste123" });
    cookie = res.headers["set-cookie"] as unknown as string[];
    loginBody = res.body as Record<string, unknown>;
  });

  afterAll(async () => {
    await app.close();
  });

  it("autentica e devolve o utilizador com os papéis, sem a password", () => {
    expect(cookie).toBeDefined();
    expect(loginBody.internalId).toBe("UJS8342");
    expect(loginBody.password).toBeUndefined();
    expect(Array.isArray(loginBody.roles)).toBe(true);
  });

  it("GET /auth/me devolve o utilizador autenticado", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", cookie)
      .expect(200);
    expect(res.body.internalId).toBe("UJS8342");
  });

  it("bloqueia uma rota protegida sem cookie (401)", async () => {
    await request(app.getHttpServer()).get("/cut-lists").expect(401);
  });

  it("permite a rota protegida com o cookie de sessão", async () => {
    const res = await request(app.getHttpServer())
      .get("/cut-lists")
      .set("Cookie", cookie)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejeita credenciais inválidas (401)", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ internalId: "UJS8342", password: "errada" })
      .expect(401);
  });
});
