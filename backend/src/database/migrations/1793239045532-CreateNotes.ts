import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotes1793239045532 implements MigrationInterface {
  name = 'CreateNotes1793239045532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(120) NOT NULL, "content" text NOT NULL DEFAULT '', "archived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a6c7d244b1cc6d781d48ebdef" ON "notes"  ("archived") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a6c7d244b1cc6d781d48ebdef"`,
    );
    await queryRunner.query(`DROP TABLE "notes"`);
  }
}
