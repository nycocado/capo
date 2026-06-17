import {
  MariaDbDriver,
  Options,
  UnderscoreNamingStrategy,
} from "@mikro-orm/mariadb";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { ConfigService } from "@nestjs/config";

/**
 * Monta a configuração do MikroORM a partir do ConfigService.
 *
 * @param config Serviço de configuração (variáveis de ambiente)
 * @returns Opções do MikroORM para o driver MariaDB
 */
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
    namingStrategy: UnderscoreNamingStrategy,
    // Decorators legacy usam metadados de reflexão (emitDecoratorMetadata)
    metadataProvider: ReflectMetadataProvider,
    debug: !isProduction,
    // Relações sempre serializadas como objeto (consistência na serialização nativa)
    serialization: {
      forceObject: true,
    },
    allowGlobalContext: true,
    highlighter: isProduction ? undefined : new SqlHighlighter(),
  };
};
