import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './src/config/database.helper';

config();

export default new DataSource(
  buildDataSourceOptions({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.TYPEORM_SYNC === 'true',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['migrations/*.ts'],
  }),
);
