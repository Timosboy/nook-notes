import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoteImages1793300000000 implements MigrationInterface {
  name = 'AddNoteImages1793300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "note_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "noteId" uuid NOT NULL, "filename" character varying(255) NOT NULL, "mimeType" character varying(50) NOT NULL, "size" integer NOT NULL, "data" bytea NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_note_images" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_note_images_noteId" ON "note_images" ("noteId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_images" ADD CONSTRAINT "FK_note_images_noteId" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "note_images" DROP CONSTRAINT "FK_note_images_noteId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_note_images_noteId"`);
    await queryRunner.query(`DROP TABLE "note_images"`);
  }
}
