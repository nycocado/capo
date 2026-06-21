import { createConnection } from "mariadb";
import { readFileSync } from "fs";
import { join } from "path";

const dbDir = join(__dirname, "..", "..", "db");
const files = ["99-drop-tables.sql", "01-create.sql", "02-insert.sql"];

export default async function globalSetup(): Promise<void> {
  const conn = await createConnection({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? "3306"),
    user: process.env.DATABASE_USER ?? "capo",
    password: process.env.DATABASE_PASSWORD ?? "troque-esta-senha",
    database: process.env.DATABASE_NAME ?? "capo_test",
    multipleStatements: true,
  });

  try {
    for (const file of files) {
      await conn.query(readFileSync(join(dbDir, file), "utf8"));
    }
  } finally {
    await conn.end();
  }
}
