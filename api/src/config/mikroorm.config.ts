import {
  MariaDbDriver,
  Options,
  UnderscoreNamingStrategy,
} from "@mikro-orm/mariadb";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { ConfigService } from "@nestjs/config";

export const createMikroOrmConfig = (config: ConfigService): Options => {
  const isProduction = config.getOrThrow("NODE_ENV") === "production";

  return {
    driver: MariaDbDriver,
    host: config.getOrThrow("DATABASE_HOST"),
    port: parseInt(config.getOrThrow("DATABASE_PORT")),
    user: config.getOrThrow("DATABASE_USER"),
    password: config.getOrThrow("DATABASE_PASSWORD"),
    dbName: config.getOrThrow("DATABASE_NAME"),
    entities: ["dist/**/*.entity.js"],
    entitiesTs: ["src/**/*.entity.ts"],
    preferTs: !isProduction,
    namingStrategy: UnderscoreNamingStrategy,
    metadataProvider: ReflectMetadataProvider,
    debug: !isProduction,
    serialization: {
      forceObject: true,
    },
    allowGlobalContext: true,
    highlighter: isProduction ? undefined : new SqlHighlighter(),
  };
};
