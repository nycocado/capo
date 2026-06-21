import { StartedTestContainer } from "testcontainers";
import { rmSync } from "fs";
import { join } from "path";

export default async function globalTeardown(): Promise<void> {
  const container = (globalThis as Record<string, unknown>)
    .__MARIADB_CONTAINER__ as StartedTestContainer | undefined;
  if (container) {
    await container.stop();
  }
  rmSync(join(__dirname, ".testcontainer.json"), { force: true });
}
