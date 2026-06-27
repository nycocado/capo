import { GenericContainer, Wait } from "testcontainers";
import { createConnection, Connection } from "mariadb";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const dbDir = join(__dirname, "..", "..", "db");
const runtimeFile = join(__dirname, ".testcontainer.json");
const schema = ["01-create.sql", "02-insert.sql"];

function usePodmanSocketIfPresent(): void {
  if (process.env.DOCKER_HOST) {
    return;
  }
  const socket = `/run/user/${process.getuid?.() ?? ""}/podman/podman.sock`;
  if (existsSync(socket)) {
    process.env.DOCKER_HOST = `unix://${socket}`;
    process.env.TESTCONTAINERS_RYUK_DISABLED ??= "true";
  }
}

async function connect(
  opts: Parameters<typeof createConnection>[0],
  attempts = 20,
): Promise<Connection> {
  for (let i = 1; ; i++) {
    try {
      return await createConnection(opts);
    } catch (error) {
      if (i >= attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function setupWithServiceContainer(): Promise<void> {
  const config = {
    host: "127.0.0.1",
    port: 3306,
    user: "capo",
    password: "capo",
    database: "capo_test",
  };
  const conn = await connect({ ...config, multipleStatements: true });
  try {
    for (const file of schema) {
      await conn.query(readFileSync(join(dbDir, file), "utf8"));
    }
  } finally {
    await conn.end();
  }
  writeFileSync(runtimeFile, JSON.stringify(config));
}

async function setupWithTestcontainers(): Promise<void> {
  usePodmanSocketIfPresent();

  const container = await new GenericContainer("mariadb:lts")
    .withEnvironment({
      MARIADB_ROOT_PASSWORD: "root",
      MARIADB_DATABASE: "capo_test",
      MARIADB_USER: "capo",
      MARIADB_PASSWORD: "capo",
    })
    .withExposedPorts(3306)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const config = {
    host: container.getHost(),
    port: container.getMappedPort(3306),
    user: "capo",
    password: "capo",
    database: "capo_test",
  };

  const conn = await connect({ ...config, multipleStatements: true });
  try {
    for (const file of schema) {
      await conn.query(readFileSync(join(dbDir, file), "utf8"));
    }
  } finally {
    await conn.end();
  }

  writeFileSync(runtimeFile, JSON.stringify(config));
  (globalThis as Record<string, unknown>).__MARIADB_CONTAINER__ = container;
}

export default async function globalSetup(): Promise<void> {
  if (process.env.CI) {
    await setupWithServiceContainer();
  } else {
    await setupWithTestcontainers();
  }
}
