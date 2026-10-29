import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategories1793245632160 implements MigrationInterface {
  name = 'AddCategories1793245632160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(40) NOT NULL, "color" character varying(16) NOT NULL DEFAULT 'gray', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_categories_color" CHECK ("color" IN ('gray', 'red', 'blue', 'green', 'yellow', 'purple')), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_name" ON "categories" (lower("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_categories" ("noteId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_5a3d1fe9210eba03b16aa24d214" PRIMARY KEY ("noteId", "categoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21a9fe7424945efd8ba051e412" ON "note_categories"  ("noteId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7de7c7f391477ca7cf2f0052f7" ON "note_categories"  ("categoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "note_categories" ADD CONSTRAINT "FK_21a9fe7424945efd8ba051e4122" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_categories" ADD CONSTRAINT "FK_7de7c7f391477ca7cf2f0052f77" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_categories" DROP CONSTRAINT "FK_7de7c7f391477ca7cf2f0052f77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_categories" DROP CONSTRAINT "FK_21a9fe7424945efd8ba051e4122"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7de7c7f391477ca7cf2f0052f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21a9fe7424945efd8ba051e412"`,
    );
    await queryRunner.query(`DROP TABLE "note_categories"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_categories_name"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
