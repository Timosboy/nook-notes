import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { dataSourceOptions } from './database/data-source';
import { CategoriesModule } from './categories/categories.module';
import { NotesModule } from './notes/notes.module';
import { ImagesModule } from './images/images.module';

import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot(dataSourceOptions),
    NotesModule,
    CategoriesModule,
    ImagesModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
