import {
  MariaDbDriver,
  Options,
  UnderscoreNamingStrategy,
} from '@mikro-orm/mariadb';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const microOrmConfig: Options = {
  driver: MariaDbDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'capo',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  namingStrategy: UnderscoreNamingStrategy,
  debug: process.env.NODE_ENV !== 'production',
  seeder: {
    path: './src/database/seeders',
  },
  serialization: {
    forceObject: true,
  },
  allowGlobalContext: true,
  highlighter:
    process.env.NODE_ENV !== 'production' ? new SqlHighlighter() : undefined,
};
