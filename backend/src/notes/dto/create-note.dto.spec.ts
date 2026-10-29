import { validate } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';

describe('CreateNoteDto emoji', () => {
  it.each(['🚀', '👩🏽‍💻', '🇧🇴', '1️⃣'])('accepts %s', async (emoji) => {
    const dto = Object.assign(new CreateNoteDto(), { title: 'Note', emoji });

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it.each(['a', '🚀🚀', '', 'this is far too long'])(
    'rejects %s',
    async (emoji) => {
      const dto = Object.assign(new CreateNoteDto(), { title: 'Note', emoji });

      const errors = await validate(dto);

      expect(errors[0]?.constraints).toMatchObject({
        matches: 'Emoji must be a single emoji',
      });
    },
  );

  it('allows null to clear the emoji', async () => {
    const dto = Object.assign(new CreateNoteDto(), {
      title: 'Note',
      emoji: null,
    });

    await expect(validate(dto)).resolves.toEqual([]);
  });
});
