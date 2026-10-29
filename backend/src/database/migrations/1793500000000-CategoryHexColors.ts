import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoryHexColors1793500000000 implements MigrationInterface {
  name = 'CategoryHexColors1793500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "CHK_categories_color"`,
    );
    await queryRunner.query(
      `UPDATE "categories" SET "color" = CASE "color" WHEN 'gray' THEN '#787774' WHEN 'red' THEN '#d44c47' WHEN 'blue' THEN '#337ea9' WHEN 'green' THEN '#448361' WHEN 'yellow' THEN '#cb912f' WHEN 'purple' THEN '#9065b0' ELSE '#787774' END`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "color" SET DEFAULT '#787774'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "CHK_categories_color" CHECK ("color" ~ '^#[0-9a-f]{6}$')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "CHK_categories_color"`,
    );
    await queryRunner.query(
      `UPDATE "categories" SET "color" = CASE "color" WHEN '#d44c47' THEN 'red' WHEN '#337ea9' THEN 'blue' WHEN '#448361' THEN 'green' WHEN '#cb912f' THEN 'yellow' WHEN '#9065b0' THEN 'purple' ELSE 'gray' END`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "color" SET DEFAULT 'gray'`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "CHK_categories_color" CHECK ("color" IN ('gray', 'red', 'blue', 'green', 'yellow', 'purple'))`,
    );
  }
}
