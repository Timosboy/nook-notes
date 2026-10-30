import { hash } from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEMO_USER_ID } from '../../users/demo-user';
import {
  REVIEWER_USER_ID,
  REVIEWER_EMAIL,
  REVIEWER_PASSWORD,
  REVIEWER_NAME,
} from '../../users/reviewer-user';

// Creates the account given to the reviewers and copies the demo notes into it.
// A copied row gets the id md5(old id || reviewer id), so links stay consistent.
export class AddReviewerAccount1793900000000 implements MigrationInterface {
  name = 'AddReviewerAccount1793900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "name", "passwordHash") VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [
        REVIEWER_USER_ID,
        REVIEWER_EMAIL,
        REVIEWER_NAME,
        await hash(REVIEWER_PASSWORD, 10),
      ],
    );
    const [{ count }] = (await queryRunner.query(
      `SELECT count(*)::int AS "count" FROM "notes" WHERE "userId" = $1`,
      [REVIEWER_USER_ID],
    )) as { count: number }[];
    if (count > 0) return;

    const ids = [REVIEWER_USER_ID, DEMO_USER_ID, REVIEWER_USER_ID];
    await queryRunner.query(
      `INSERT INTO "categories" ("id", "userId", "name", "color", "createdAt")
       SELECT md5("id"::text || $3)::uuid, $1, "name", "color", "createdAt"
       FROM "categories" WHERE "userId" = $2`,
      ids,
    );
    await queryRunner.query(
      `INSERT INTO "notes" ("id", "userId", "title", "content", "emoji", "archived", "pinned", "createdAt", "updatedAt")
       SELECT md5("id"::text || $3)::uuid, $1, "title", "content", "emoji", "archived", "pinned", "createdAt", "updatedAt"
       FROM "notes" WHERE "userId" = $2`,
      ids,
    );
    await queryRunner.query(
      `INSERT INTO "note_categories" ("noteId", "categoryId")
       SELECT md5(link."noteId"::text || $2)::uuid, md5(link."categoryId"::text || $2)::uuid
       FROM "note_categories" link JOIN "notes" note ON note."id" = link."noteId"
       WHERE note."userId" = $1`,
      [DEMO_USER_ID, REVIEWER_USER_ID],
    );
    const images = (await queryRunner.query(
      `INSERT INTO "note_images" ("id", "noteId", "filename", "mimeType", "size", "data", "createdAt")
       SELECT md5(image."id"::text || $2)::uuid, md5(image."noteId"::text || $2)::uuid,
         image."filename", image."mimeType", image."size", image."data", image."createdAt"
       FROM "note_images" image JOIN "notes" note ON note."id" = image."noteId"
       WHERE note."userId" = $1
       RETURNING "id", "noteId"`,
      [DEMO_USER_ID, REVIEWER_USER_ID],
    )) as { id: string; noteId: string }[];
    for (const image of images) {
      const [source] = (await queryRunner.query(
        `SELECT image."id", image."noteId" FROM "note_images" image JOIN "notes" note ON note."id" = image."noteId"
         WHERE note."userId" = $1 AND md5(image."id"::text || $2)::uuid = $3`,
        [DEMO_USER_ID, REVIEWER_USER_ID, image.id],
      )) as { id: string; noteId: string }[];
      await queryRunner.query(
        `UPDATE "notes" SET "content" = replace("content", $1, $2) WHERE "id" = $3`,
        [
          `/api/notes/${source.noteId}/images/${source.id}`,
          `/api/notes/${image.noteId}/images/${image.id}`,
          image.noteId,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "id" = $1`, [
      REVIEWER_USER_ID,
    ]);
  }
}
