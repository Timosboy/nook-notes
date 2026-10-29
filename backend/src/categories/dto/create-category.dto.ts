import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  Matches,
  IsString,
  MaxLength,
} from 'class-validator';
import { CATEGORY_NAME_MAX_LENGTH } from '../category.entity';

const normalizeColor = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase() : value;

export class CreateCategoryDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  name: string;

  @IsOptional()
  @Transform(normalizeColor)
  @Matches(/^#[0-9a-f]{6}$/i, {
    message: 'Color must be a hex value like #1a2b3c',
  })
  color = '#787774';
}
