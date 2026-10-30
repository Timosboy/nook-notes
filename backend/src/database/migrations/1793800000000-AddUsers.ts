import { hash } from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  DEMO_USER_ID,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_NAME,
} from '../../users/demo-user';

export class AddUsers1793800000000 implements MigrationInterface {
  name = 'AddUsers1793800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(254) NOT NULL, "name" character varying(60) NOT NULL, "passwordHash" character varying(100) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_users" PRIMARY KEY ("id"), CONSTRAINT "UQ_users_email" UNIQUE ("email"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "name", "passwordHash") VALUES ($1, $2, $3, $4)`,
      [DEMO_USER_ID, DEMO_EMAIL, DEMO_NAME, await hash(DEMO_PASSWORD, 10)],
    );
    await queryRunner.query(`ALTER TABLE "notes" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "categories" ADD "userId" uuid`);
    await queryRunner.query(`UPDATE "notes" SET "userId" = $1`, [DEMO_USER_ID]);
    await queryRunner.query(`UPDATE "categories" SET "userId" = $1`, [
      DEMO_USER_ID,
    ]);
    await queryRunner.query(
      `ALTER TABLE "notes" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_notes_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notes_userId" ON "notes" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_userId" ON "categories" ("userId")`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_categories_name"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_name" ON "categories" ("userId", lower("name"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_categories_name"`);
    await queryRunner.query(`
      INSERT INTO "note_categories" ("noteId", "categoryId")
      SELECT link."noteId", canonical."id"
      FROM "note_categories" link
      JOIN "categories" category ON category."id" = link."categoryId"
      JOIN (SELECT DISTINCT ON (lower("name")) "id", "name" FROM "categories" ORDER BY lower("name"), "id") canonical
        ON lower(canonical."name") = lower(category."name")
      ON CONFLICT DO NOTHING
    `);
    await queryRunner.query(
      `DELETE FROM "categories" WHERE "id" NOT IN (SELECT DISTINCT ON (lower("name")) "id" FROM "categories" ORDER BY lower("name"), "id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_name" ON "categories" (lower("name"))`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notes_userId"`);
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_notes_userId"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "userId"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
