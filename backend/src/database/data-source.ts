import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';
import configuration from '../config/configuration';

const database = configuration().database;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: database.host,
  port: database.port,
  username: database.user,
  password: database.password,
  database: database.name,
  ssl: database.ssl ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
