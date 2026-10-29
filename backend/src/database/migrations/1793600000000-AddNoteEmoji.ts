import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoteEmoji1793600000000 implements MigrationInterface {
  name = 'AddNoteEmoji1793600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD "emoji" character varying(16)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "emoji"`);
  }
}
