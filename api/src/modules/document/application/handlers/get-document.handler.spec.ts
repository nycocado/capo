import { NotFoundException, StreamableFile } from "@nestjs/common";
import { resolve } from "path";
import { GetDocumentHandler } from "@modules/document/application/handlers/get-document.handler";
import { GetDocumentQuery } from "@modules/document/application/queries";

const storage = resolve(__dirname, "../../../../../storage");

describe("GetDocumentHandler", () => {
  let handler: GetDocumentHandler;

  beforeEach(() => {
    process.env.STORAGE_PATH = storage;
    handler = new GetDocumentHandler();
  });

  function get(section: string, filename: string): Promise<StreamableFile> {
    return handler.execute(new GetDocumentQuery({ section, filename }));
  }

  it("serve um PDF existente de uma secção permitida", async () => {
    await expect(get("isometric", "ISO0001.pdf")).resolves.toBeInstanceOf(
      StreamableFile,
    );
  });

  it("rejeita uma secção fora da allowlist", async () => {
    await expect(get("etc", "passwd")).rejects.toThrow(NotFoundException);
  });

  it("bloqueia path traversal com `../`", async () => {
    await expect(get("isometric", "../../package.json")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("bloqueia um caminho absoluto que escapa da secção", async () => {
    await expect(get("isometric", "/etc/passwd")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("404 para um ficheiro inexistente", async () => {
    await expect(get("isometric", "naoexiste.pdf")).rejects.toThrow(
      NotFoundException,
    );
  });
});
