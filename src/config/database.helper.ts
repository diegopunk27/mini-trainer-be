import { DataSourceOptions } from 'typeorm';

export interface DatabaseConnectionInput {
  host?: string;
  port?: string | number;
  username?: string;
  password?: string;
  database?: string;
  synchronize?: boolean;
  entities: DataSourceOptions['entities'];
  migrations?: DataSourceOptions['migrations'];
}

export const buildDataSourceOptions = (input: DatabaseConnectionInput): DataSourceOptions => {
  return {
    type: 'postgres',
    host: input.host ?? 'localhost',
    port: Number(input.port ?? 5432),
    username: input.username ?? 'postgres',
    password: input.password ?? '',
    database: input.database ?? 'app_dev',
    synchronize: input.synchronize ?? false,
    entities: input.entities,
    migrations: input.migrations,
  };
};
