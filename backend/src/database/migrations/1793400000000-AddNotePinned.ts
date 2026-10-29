import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotePinned1793400000000 implements MigrationInterface {
  name = 'AddNotePinned1793400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" ADD "pinned" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "pinned"`);
  }
}
