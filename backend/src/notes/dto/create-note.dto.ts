import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { TITLE_MAX_LENGTH } from '../note.entity';

export class CreateNoteDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(TITLE_MAX_LENGTH)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.{1,16}$)(?:\p{Extended_Pictographic}|\p{Regional_Indicator}{2}|[0-9#*]\uFE0F?\u20E3)(?:\uFE0F|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*$/u,
    {
      message: 'Emoji must be a single emoji',
    },
  )
  emoji?: string | null;
}
