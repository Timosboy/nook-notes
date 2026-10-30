import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRowLevelSecurity1793700000000 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1793700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        item record;
      BEGIN
        FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
          EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename);
        END LOOP;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        item record;
      BEGIN
        FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
          EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', item.tablename);
        END LOOP;
      END $$
    `);
  }
}
