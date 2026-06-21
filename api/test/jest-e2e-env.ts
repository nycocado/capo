import { readFileSync } from "fs";
import { join } from "path";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ??= "test-secret-not-for-production";
process.env.JWT_EXPIRATION ??= "8h";
process.env.CORS_ORIGIN ??= "http://localhost:3000";

const runtime = JSON.parse(
  readFileSync(join(__dirname, ".testcontainer.json"), "utf8"),
) as {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

process.env.DATABASE_HOST = runtime.host;
process.env.DATABASE_PORT = String(runtime.port);
process.env.DATABASE_USER = runtime.user;
process.env.DATABASE_PASSWORD = runtime.password;
process.env.DATABASE_NAME = runtime.database;
